const SubscriptionOffer = require('../models/SubscriptionOffer');

// get all offers
exports.getOffers = async () => {
	try {
		const offers = await SubscriptionOffer.find();
		return offers;
	} catch (error) {
		throw error;
	}
};

// create a new offer
exports.createOffer = async (req) => {
	try {
		const newOffer = new SubscriptionOffer({
			discount: req.body.discount,
			storesNumber: req.body.storesNumber,
		});
		await newOffer.save();
		return newOffer;
	} catch (error) {
		throw error;
	}
};

// update an offer
exports.updateOffer = async (req) => {
	try {
		const offer = await SubscriptionOffer.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!offer) throw Error('The offer with the given ID was not found.');
		return offer;
	} catch (error) {
		throw error;
	}
};

// delete an offer
exports.deleteOffer = async (req) => {
	try {
		await SubscriptionOffer.findByIdAndDelete(req.params.id);
		return { message: 'Offer deleted successfully' };
	} catch (error) {
		throw error;
	}
};
