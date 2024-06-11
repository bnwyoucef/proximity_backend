const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { indexSubscriptionToElasticsearch, deleteIndexedSubscription } = require('./elasticSearchService');
const { getActiveOffer } = require('./subscriptionOfferService');
const { updateStore } = require('./storeService');

// get all Subscriptions
exports.getSubscriptions = async () => {
	try {
		const subscriptions = await Subscription.find();
		return subscriptions;
	} catch (error) {
		throw error;
	}
};

// get all Subscriptions created by a payment manager
exports.getTransactions = async (paymentManagerId) => {
	try {
		const subscriptions = await Subscription.aggregate([
			{
				$match: { paymentManagerId: mongoose.Types.ObjectId(paymentManagerId) },
			},
			{
				$lookup: {
					from: 'plans',
					localField: 'planId',
					foreignField: '_id',
					as: 'plan',
				},
			},
			{
				$unwind: {
					path: '$plan',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'stores',
					let: { storeId: '$storeId' },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$_id', '$$storeId'] },
							},
						},
						{
							$project: {
								_id: 0,
								name: 1,
							},
						},
					],
					as: 'store',
				},
			},
			{
				$unwind: {
					path: '$store',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$unset: 'planId',
			},
		]);
		const transactions = subscriptions.map((subscription) => {
			return {
				type: subscription.plan.type,
				paymentAmount: subscription.paymentAmount,
				startDate: subscription.startDate,
				storeName: subscription.store.name,
			};
		});
		return transactions;
	} catch (error) {
		throw error;
	}
};

exports.getSubscriptionById = async (id) => {
	try {
		const subscription = await Subscription.aggregate([
			{
				$match: { _id: mongoose.Types.ObjectId(id) },
			},
			{
				$lookup: {
					from: 'plans',
					localField: 'planId',
					foreignField: '_id',
					as: 'plan',
				},
			},
			{
				$unwind: {
					path: '$plan',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'plans',
					localField: 'subscriptionsHistory.planId',
					foreignField: '_id',
					as: 'subscriptionsHistoryPlans',
				},
			},
			{
				$addFields: {
					subscriptionsHistory: {
						$map: {
							input: '$subscriptionsHistory',
							as: 'history',
							in: {
								$mergeObjects: [
									'$$history',
									{
										plan: {
											$arrayElemAt: [
												{
													$filter: {
														input: '$subscriptionsHistoryPlans',
														as: 'plan',
														cond: { $eq: ['$$plan._id', '$$history.planId'] },
													},
												},
												0,
											],
										},
									},
								],
							},
						},
					},
				},
			},
			{
				$lookup: {
					from: 'plans',
					localField: 'upcomingSubscriptions.planId',
					foreignField: '_id',
					as: 'upcomingSubscriptionsPlans',
				},
			},
			{
				$addFields: {
					upcomingSubscriptions: {
						$map: {
							input: '$upcomingSubscriptions',
							as: 'upcoming',
							in: {
								$mergeObjects: [
									'$$upcoming',
									{
										plan: {
											$arrayElemAt: [
												{
													$filter: {
														input: '$upcomingSubscriptionsPlans',
														as: 'plan',
														cond: { $eq: ['$$plan._id', '$$upcoming.planId'] },
													},
												},
												0,
											],
										},
									},
								],
							},
						},
					},
				},
			},
			{
				$unset: ['subscriptionsHistory.planId', 'upcomingSubscriptions.planId'],
			},
			{
				$group: {
					_id: '$_id',
					paymentManagerId: { $first: '$paymentManagerId' },
					storeId: { $first: '$storeId' },
					paymentAmount: { $first: '$paymentAmount' },
					status: { $first: '$status' },
					startDate: { $first: '$startDate' },
					endDate: { $first: '$endDate' },
					notes: { $first: '$notes' },
					plan: { $first: '$plan' },
					subscriptionsHistory: { $first: '$subscriptionsHistory' },
					upcomingSubscriptions: { $first: '$upcomingSubscriptions' },
				},
			},
		]);

		return subscription[0];
	} catch (error) {
		throw error;
	}
};

// create a new Subscription
exports.createSubscription = async (req) => {
	try {
		// get the active offer
		const activeOffer = await getActiveOffer();
		const currentSubscription = await Subscription.findById(req.body.subscriptionId);
		//add an upcoming subscription
		if (req.body.upcoming) {
			let { subscriptionsHistory, _id, storeId, ...upcomingSubscription } = currentSubscription._doc;
			upcomingSubscription.status = 'upcoming';
			upcomingSubscription.paymentManagerId = req.body.paymentManagerId;
			upcomingSubscription.planId = req.body.planId;
			// TODO: check why the paymentTypeId not added
			upcomingSubscription.paymentTypeId = req.body.paymentTypeId;
			upcomingSubscription.startDate = req.body.startDate;
			upcomingSubscription.endDate = req.body.endDate;
			// apply the discount depending on the current active offer
			if (activeOffer) {
				upcomingSubscription.subscriptionOfferId = activeOffer.id;
				upcomingSubscription.paymentAmount = req.body.paymentAmount - (req.body.paymentAmount * activeOffer.discount) / 100;
			}
			currentSubscription.upcomingSubscriptions.unshift(upcomingSubscription);
			await this.updateSubscription(req.body.subscriptionId, { upcomingSubscriptions: currentSubscription.upcomingSubscriptions }, true);
			return currentSubscription;
		}
		// checking if the subscription exists
		// if it exists change the current subscription to new one
		// and push the previous one to the history list
		if (req.body.subscriptionId) {
			//update the current subscription
			let { subscriptionsHistory, _id, storeId, ...previousSubscription } = currentSubscription._doc;
			previousSubscription.status = 'suspended';
			currentSubscription.subscriptionsHistory.unshift(previousSubscription);
			req.body.subscriptionsHistory = currentSubscription.subscriptionsHistory;
			// apply the discount depending on the current active offer
			if (activeOffer) {
				req.body.subscriptionOfferId = activeOffer.id;
				req.body.paymentAmount = req.body.paymentAmount - (req.body.paymentAmount * activeOffer.discount) / 100;
			}
			await this.updateSubscription(req.body.subscriptionId, req.body, false);
			return currentSubscription;
		} else {
			if (activeOffer) {
				req.body.paymentAmount = req.body.paymentAmount - (req.body.paymentAmount * activeOffer.discount) / 100;
			}
			// create a new subscription
			const newSubscription = new Subscription({
				paymentManagerId: req.body.paymentManagerId,
				storeId: req.body.storeId,
				planId: req.body.planId,
				subscriptionOfferId: activeOffer.id,
				paymentAmount: req.body.paymentAmount,
				paymentTypeId: req.body.paymentTypeId,
				startDate: req.body.startDate,
				endDate: req.body.endDate,
				notes: req.body.notes,
				subscriptionsHistory: req.body.subscriptionsHistory,
				upcomingSubscriptions: [],
			});
			await newSubscription.save();
			//TODO:add a condition to excute if the request just
			// come from multi store subscription
			updateStore({ params: { id: req.body.storeId }, body: { subscriptionId: newSubscription.id, changeSubscription: true } });
			indexSubscriptionToElasticsearch(newSubscription);
			return newSubscription;
		}
	} catch (error) {
		throw error;
	}
};

// update a subscription
exports.updateSubscription = async (id, body, isUpcomingSubscription) => {
	try {
		const subscription = await Subscription.findByIdAndUpdate(id, body, {
			new: true,
		});
		if (!subscription) throw Error('The subscription with the given ID was not found.');
		if (!isUpcomingSubscription) {
			// update the status of the indexed subscription from active to suspended
			deleteIndexedSubscription(subscription.id);
			indexSubscriptionToElasticsearch(subscription.subscriptionsHistory[0], subscription.storeId);
			indexSubscriptionToElasticsearch(subscription);
		}
		return subscription;
	} catch (error) {
		throw error;
	}
};

// add a note
exports.addNote = async (id, historyId, notes) => {
	try {
		const subscription = await Subscription.findById(id);

		if (!subscription) {
			throw new Error('Subscription not found');
		}

		const historyItem = subscription.subscriptionsHistory.id(historyId);
		if (!historyItem) {
			throw new Error('History subscription not found');
		}
		historyItem.notes = notes;
		await subscription.save();

		return subscription;
	} catch (error) {
		throw error;
	}
};

exports.createMultiStoreSubscription = async (req) => {
	try {
		let newSubscriptionsList = [];
		req.body.subscriptions.map(async (subscription) => {
			console.log('~~~~~~~~~~~~~~~~~~~~++++ ', subscription);
			let newSubscription = await exports.createSubscription({ body: subscription });
			newSubscriptionsList.push(newSubscription);
		});
		return;
	} catch (error) {
		throw error;
	}
};

cron.schedule('0 0 * * *', async () => {
	try {
		// TODO: get the today date
		const today = '2025-10-04T16:46:10.715+00:00';
		//today.setHours(0, 0, 0, 0);

		// Find subscriptions with renewal date matching today's date
		const matchingSubscriptions = await Subscription.find({ endDate: today });
		// Filtering the subscriptions that have another upcoming subscripiton
		await Promise.all(
			matchingSubscriptions.map(async (subscription) => {
				if (subscription.upcomingSubscriptions.length > 0) {
					// Push the current subsription to the subscriptionsHistory List
					let { subscriptionsHistory, _id, storeId, ...previousSubscription } = subscription._doc;
					previousSubscription.status = 'suspended';
					subscription.subscriptionsHistory.unshift(previousSubscription);
					// update the current subscription with the upcoming one
					let newSubscription = subscription.upcomingSubscriptions[0];
					newSubscription.subscriptionsHistory = subscription.subscriptionsHistory;
					newSubscription.status = 'active';
					newSubscription.storeId = subscription.storeId;
					// remove the upcoming one from the upcoming subscriptions list
					subscription.upcomingSubscriptions.shift();
					newSubscription.upcomingSubscriptions = subscription.upcomingSubscriptions;
					let { _id: id, ...upcomingSub } = newSubscription._doc;
					upcomingSub.upcomingSubscriptions = subscription.upcomingSubscriptions;
					upcomingSub.subscriptionsHistory = subscription.subscriptionsHistory;
					await this.updateSubscription(subscription.id, upcomingSub, false);
					return;
				} else {
					// TODO: Test this case
					let { _id, ...updatedSubscription } = subscription._doc;
					// change the current subscription status to suspended
					updatedSubscription.status = 'suspended';
					// remove the id field
					exports.updateSubscription(subscription.id, updatedSubscription, false);
				}
			})
		);
		console.log('Auto Subscription status updated successfully.');
		return;
	} catch (err) {
		console.error('Error updating subscription status:', err);
	}
});
