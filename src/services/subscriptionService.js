const Subscription = require('../models/Subscription');

// get all Subscriptions
exports.getSubscriptions = async () => {
	try {
		const subscriptions = await Subscription.find();
		return subscriptions;
	} catch (error) {
		throw error;
	}
};

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

//create the id of an subscription in the history array
function modifyId(objectId, numberOfHistory) {
	const strId = objectId.toString();
	return strId + numberOfHistory;
}
