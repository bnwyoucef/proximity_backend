const SubscriptionOfferService = require('../services/subscriptionOfferService');

// get all subscription Offers
exports.getOffers = async (req, res) => {
	try {
		const offers = await SubscriptionOfferService.getOffers(req.params.planId);
		res.send(offers);
	} catch (error) {
		res.status(500).send(err.message);
	}
};

// create a new offer
exports.createOffer = async (req, res) => {
	try {
		const newOffer = await SubscriptionOfferService.createOffer(req);
		res.send(newOffer);
	} catch (error) {
		res.status(500).send(err.message);
	}
};

// update an offer
exports.updateOffer = async (req, res) => {
	try {
		const updatedOffer = await SubscriptionOfferService.updateOffer(req);
		res.send(updatedOffer);
	} catch (error) {
		res.status(500).send(err.message);
	}
};

// delete an offer
exports.deleteOffer = async (req, res) => {
	try {
		const message = await SubscriptionOfferService.deleteOffer(req);
		res.send(message);
	} catch (error) {
		res.status(500).send(err.message);
	}
};
