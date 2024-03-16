const SubscriptionService = require('../services/subscriptionService');

// get all subscriptions
exports.getSubscriptions = async (req, res) => {
	try {
		const subscriptions = await SubscriptionService.getSubscriptions();
		res.send(subscriptions);
	} catch (error) {
		res.status(500).send(err.message);
	}
};

// create a new subscription
exports.createSubscription = async (req, res) => {
	try {
		const newSubscription = await SubscriptionService.createSubscription(req);
		res.send(newSubscription);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// update an subscription
exports.updateSubscription = async (req, res) => {
	try {
		const updateSubscription = await SubscriptionService.updateSubscription(req.params.id, req.body);
		res.send(updateSubscription);
	} catch (error) {
		res.status(500).send(err.message);
	}
};
