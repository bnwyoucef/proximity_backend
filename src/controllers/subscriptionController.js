const SubscriptionService = require('../services/subscriptionService');

// get all subscriptions
exports.getSubscriptions = async (req, res) => {
	try {
		const subscriptions = await SubscriptionService.getSubscriptions();
		res.send(subscriptions);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// get all Subscriptions created by a payment manager
exports.getTransactions = async (req, res) => {
	try {
		const transactions = await SubscriptionService.getTransactions(req.params.paymentManagerId);
		res.send(transactions);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// get subscription by id
exports.getSubscriptionById = async (req, res) => {
	try {
		const subscription = await SubscriptionService.getSubscriptionById(req.params.id);
		res.send(subscription);
	} catch (error) {
		res.status(500).send(error.message);
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
		res.status(500).send(error.message);
	}
};

// add a new note
exports.addNote = async (req, res) => {
	try {
		const updateSubscription = await SubscriptionService.addNote(req.params.id, req.body.historyId, req.body.notes);
		res.send(updateSubscription);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
// create a subscription for multi store
exports.createMultiStoreSubscription = async (req, res) => {
	try {
		const subscripitons = await SubscriptionService.createMultiStoreSubscription(req);
		res.send(subscripitons);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
