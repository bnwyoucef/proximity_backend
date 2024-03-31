const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// get all Subscriptions
exports.getSubscriptions = async () => {
	try {
		const subscriptions = await Subscription.find();
		return subscriptions;
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
				$unwind: {
					path: '$subscriptionsHistory',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$unwind: {
					path: '$subscriptionsHistoryPlans',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$addFields: {
					'subscriptionsHistory.plan': '$subscriptionsHistoryPlans',
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
					subscriptionsHistory: { $push: '$subscriptionsHistory' },
				},
			},
		]);

		return subscription[0];
	} catch (error) {
		throw error;
	}
};

// try {
// 	const subscription = await Subscription.findById(id);
// 	return subscription;
// } catch (error) {
// 	throw error;
// }

// create a new Subscription
exports.createSubscription = async (req) => {
	try {
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
		return subscription;
	} catch (error) {
		throw error;
	}
};
