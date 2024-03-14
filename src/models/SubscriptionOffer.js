const mongoose = require('mongoose');

const subscriptionOfferSchema = new mongoose.Schema(
	{
		discount: {
			type: Number,
			required: true,
		},
		storesNumber: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('SubscriptionOffer', subscriptionOfferSchema);
