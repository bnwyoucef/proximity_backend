const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');
const { indexSubscriptionToElasticsearch, deleteIndexedSubscription } = require('./elasticSearchService');

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
				$unset: 'subscriptionsHistory.planId',
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
		// checking if the subscription exists
		if (req.body.subscriptionId) {
			//update the current subscription
			const currentSubscription = await Subscription.findById(req.body.subscriptionId);
			let { subscriptionsHistory, _id, storeId, ...previousSubscription } = currentSubscription._doc;
			previousSubscription.status = 'suspended';
			currentSubscription.subscriptionsHistory.unshift(previousSubscription);
			req.body.subscriptionsHistory = currentSubscription.subscriptionsHistory;
			await this.updateSubscription(req.body.subscriptionId, req.body);
		} else {
			// create a new subscription
			const newSubscription = new Subscription({
				paymentManagerId: req.body.paymentManagerId,
				storeId: req.body.storeId,
				planId: req.body.planId,
				subscriptionOfferId: req.body.subscriptionOfferId,
				paymentAmount: req.body.paymentAmount,
				startDate: req.body.startDate,
				endDate: req.body.endDate,
				notes: req.body.notes,
				subscriptionsHistory: req.body.subscriptionsHistory,
			});
			await newSubscription.save();
			indexSubscriptionToElasticsearch(newSubscription);
			return newSubscription;
		}
	} catch (error) {
		throw error;
	}
};

// update a subscription
exports.updateSubscription = async (id, body) => {
	try {
		const subscription = await Subscription.findByIdAndUpdate(id, body, {
			new: true,
		});
		if (!subscription) throw Error('The subscription with the given ID was not found.');
		// update the status of the indexed subscription from active to suspended
		deleteIndexedSubscription(subscription.id);
		indexSubscriptionToElasticsearch(subscription.subscriptionsHistory[0], subscription.storeId);
		indexSubscriptionToElasticsearch(subscription);
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
