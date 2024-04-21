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


//  ibrahim : Define the controller function to get store by subscription ID 

exports.getStoreBySubscriptionId = async (req, res) => {
	try {
		const subscriptionId = req.params.subscriptionId; // Assuming subscriptionId is passed in the request params
		const subscription = await Subscription.findById(subscriptionId);

		if (!subscription) {
			return res.status(404).json({ message: "Subscription not found" });
		}

		const storeId = subscription.storeId;
		const store = await Store.findById(storeId);

		if (!store) {
			return res.status(404).json({ message: "Store not found" });
		}

		return res.status(200).json({ store });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};




// ibrahim : controller for bet subscrption by staus and city 
// exports.getSubscriptionByCityAndStatus = async (req, res) => {
//     try {
//         const { status, city } = req.query;
//         const subscriptions = await SubscriptionService.getSubscriptionByCityAndStatus(status, city);
//         return res.status(200).json({ subscriptions });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };
// get subscription by status 
exports.getSubscriptionsByStatus = async (req, res) => {

	const { status } = req.params;
	try {
		const subscriptions = await SubscriptionService.getSubscriptionsByStatus(status);
		res.json(subscriptions);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}
// ibrahim : change the status of a subscrption ...
exports.updateSubscriptionStatus = async (req, res, next) => {

	try {
		const { subscriptionId } = req.params;
		const { status } = req.body;

		const updatedSubscription = await SubscriptionService.updateSubscriptionStatus(subscriptionId, status);

		res.json(updatedSubscription);
	} catch (error) {
		next(error);
	}
}
// ibrahim :  get the total number of controller 
exports.getTotalSubscriptions = async (req, res) => {

	try {
	  const totalSubscriptions = await SubscriptionService.getTotalSubscriptions();
	  res.json({ totalSubscriptions });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  }







