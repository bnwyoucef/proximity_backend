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
// get alll subscription by id
exports.getSubscriptionById = async (id) => {
	try {
		const subscription = await Subscription.aggregate([
			{
				$match: { _id: mongoose.Types.ObjectId(id) },
			},
			{
				$lookup: {
					from: 'reductionoffers',
					localField: 'reductionOfferId',
					foreignField: '_id',
					as: 'reductionOffer',
				},
			},
			{
				$unwind: {
					path: '$reductionOffer',
					preserveNullAndEmptyArrays: true,
				},
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
					reductionOffer: { $first: '$reductionOffer' },
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
exports.createSubscription = async (req, isMultiStore) => {
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
			upcomingSubscription.paymentTypeId = req.body.paymentTypeId;
			upcomingSubscription.startDate = req.body.startDate;
			upcomingSubscription.endDate = req.body.endDate;
			// apply the discount depending on the current active offer
			if (activeOffer) {
				upcomingSubscription.subscriptionOfferId = activeOffer.id;
				upcomingSubscription.paymentAmount = req.body.paymentAmount - (req.body.paymentAmount * activeOffer.discount) / 100;
			}
			if (isMultiStore) currentSubscription.upcomingSubscriptions = [];
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
			req.body.status = 'active';
			// apply the discount depending on the current active offer
			if (activeOffer) {
				req.body.subscriptionOfferId = activeOffer.id;
				req.body.paymentAmount = req.body.paymentAmount - (req.body.paymentAmount * activeOffer.discount) / 100;
			}
			console.log('~~~~~~~~~~~~~~~~~~~~~~', req.body);
			if (isMultiStore) req.body.upcomingSubscriptions = [];
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
				reductionOfferId: req.body.reductionOfferId,
				paymentAmount: req.body.paymentAmount,
				paymentTypeId: req.body.paymentTypeId,
				startDate: req.body.startDate,
				endDate: req.body.endDate,
				notes: req.body.notes,
				subscriptionsHistory: req.body.subscriptionsHistory,
				upcomingSubscriptions: [],
			});
			await newSubscription.save();
			// update the store subscriptionId if the request come from multiStore subscription creation
			if (isMultiStore) updateStore({ params: { id: req.body.storeId }, body: { subscriptionId: newSubscription.id, changeSubscription: true } });
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
			await deleteIndexedSubscription(subscription.id);
			if (subscription.subscriptionsHistory[0] != null)
				await indexSubscriptionToElasticsearch(subscription.subscriptionsHistory[0], subscription.storeId);
			await indexSubscriptionToElasticsearch(subscription);
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

function getDaysBetween(startDate, endDate) {
	const oneDay = 24 * 60 * 60 * 1000; // Hours * minutes * seconds * milliseconds
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffDays = Math.round(Math.abs((end - start) / oneDay));
	return diffDays;
}

// Function to add a number of days to a date
function addDaysToDate(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
exports.createMultiStoreSubscription = async (req) => {
	try {
		let newSubscriptionsList = [];
		// check if there's any subscriptions with null id
		let isOneSubscriptionNull = false;
		let i = 0;
		while (i < req.body.subscriptions?.length && !isOneSubscriptionNull) {
			if (req.body.subscriptions[i].subscriptionId === null) {
				isOneSubscriptionNull = true;
			}
			i++;
		}
		// get all the subscriptions from the db
		let dbSubscriptions = [];
		if (!isOneSubscriptionNull) {
			i = 0;
			while (i < req.body.subscriptions?.length) {
				const dbSubscription = await Subscription.findById(req.body.subscriptions[i]?.subscriptionId);
				dbSubscriptions.push(dbSubscription);
				i++;
			}
		}

		// the start date is the first end date of one of the subscriptions in the list
		let minDate;
		let todayDate = new Date();
		if (req.body.subscriptions.length > 0) {
			minDate = new Date(dbSubscriptions[0]?.endDate);
			if (!isOneSubscriptionNull) {
				i = 1;
				while (i < req.body.subscriptions?.length) {
					let subscDate = new Date(dbSubscriptions[i]?.endDate);
					minDate = minDate < subscDate ? minDate : subscDate;
					i++;
				}
			}
		}
		req.body.subscriptions.map(async (subscription) => {
			// the start date of the subscriptions is today
			if (isOneSubscriptionNull) {
				subscription.endDate = addDaysToDate(new Date(), getDaysBetween(subscription.startDate, subscription.endDate));
				subscription.startDate = new Date();
			} else {
				if (minDate > todayDate) subscription.upcoming = true;
				subscription.endDate = addDaysToDate(minDate, getDaysBetween(subscription.endDate, subscription.startDate));
				subscription.startDate = minDate;
			}
			let newSubscription = await exports.createSubscription({ body: subscription }, true);
			newSubscriptionsList.push(newSubscription);
		});
		return;
	} catch (error) {
		throw error;
	}
};

// every day test if the subscription expired and update it
cron.schedule(
	'0 0 * * *',
	async () => {
		try {
			// Get the current date and time
			const now = new Date();
			// Extract the year, month, and day from the current date
			const year = now.getUTCFullYear();
			const month = now.getUTCMonth();
			const day = now.getUTCDate();

			// Create the start and end of the current day in UTC
			const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0));
			const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

			// Perform the query to find all documents with endDate within the current day
			const matchingSubscriptions = await Subscription.find({
				endDate: {
					$gte: startOfDay,
					$lte: endOfDay,
				},
			});
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
					} else {
						let { _id, ...updatedSubscription } = subscription._doc;
						// change the current subscription status to suspended
						updatedSubscription.status = 'suspended';
						// remove the id field
						this.updateSubscription(subscription.id, updatedSubscription, false);
					}
				})
			);
			console.log('Auto Subscription status updated successfully.');
			return;
		} catch (err) {
			console.error('Error updating subscription status:', err);
		}
	},
	{
		timezone: 'UTC',
	}
);
//   ibrahim :  get the information of the store associated with a specific subscription
exports.getStoreBySubscriptionId = async (req, res) => {
	try {
		const subscriptionId = req.params.subscriptionId;
		const subscription = await Subscription.findById(subscriptionId);

		if (!subscription) {
			return res.status(404).json({ message: 'Subscription not found' });
		}

		const storeId = subscription.storeId;
		const store = await Store.findById(storeId);

		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}

		return res.status(200).json({ store });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};
// ibrahim : function for  getSubscriptionBy Status or city

// exports.getSubscriptionByCityAndStatus = async (status, city) => {
// 	try {
// 		let filter = {};

// 		// Add status filter if provided
// 		if (status) {
// 			filter.status = status;
// 		}

// 		// Add city filter if provided
// 		if (city) {
// 			filter['storeId.address.city'] = city;
// 		}

// 		// Find subscriptions based on the filter
// 		const subscriptions = await Subscription.find(filter);
// 		return subscriptions;
// 	} catch (error) {
// 		throw error;
// 	}
// };
// get subscrption by status
exports.getSubscriptionsByStatus = async (status) => {
	try {
		const subscriptions = await Subscription.find({ status });
		return subscriptions;
	} catch (err) {
		throw new Error('Failed to fetch subscriptions by status');
	}
};
//  ibrahim :  change the status of a subscription ...
exports.updateSubscriptionStatus = async (subscriptionId, newStatus) => {
	try {
		const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, { status: newStatus }, { new: true });
		return updatedSubscription;
	} catch (error) {
		throw error;
	}
};
// ibrahim : get the totral number of subscription
exports.getTotalSubscriptions = async () => {
	try {
		const subscriptions = await Subscription.find();
		const totalSubscriptions = subscriptions.length;
		return totalSubscriptions;
	} catch (error) {
		console.error('Error fetching total subscriptions:', error);
		throw new Error('Could not fetch total subscriptions');
	}
};
// ibrahim : delete subscrption

exports.deleteSubscription = async (subscriptionId) => {
	try {
		// Find the subscription by ID and delete it
		const result = await Subscription.findByIdAndDelete(subscriptionId);

		if (!result) {
			throw new Error('Subscription not found');
		}

		return { message: 'Subscription deleted successfully' };
	} catch (error) {
		throw error;
	}
};
// ibrahim : get subscrtion with detail
exports.getSubscriptionsDetail = async () => {
	try {
		const subscriptions = await Subscription.find()
			.populate({
				path: 'storeId',
				select: 'name address', // Include the 'address' field from the referenced Store model
				populate: {
					path: 'address', // Populate the 'address' field
					select: 'city', // Include the 'city' field from the Address schema
				},
			})
			.populate({
				path: 'planId',
				select: 'type price, status', // Include 'type' and 'price' fields from the referenced Plan model
			})
			.populate({
				path: 'paymentManagerId',
				select: 'username',
			});
		return subscriptions;
	} catch (error) {
		throw error;
	}
};
