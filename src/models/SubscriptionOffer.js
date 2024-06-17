const mongoose = require('mongoose');

const subscriptionOfferSchema = new mongoose.Schema(
	{
		discount: {
			type: Number,
			required: true,
		},
		isActive: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('SubscriptionOffer', subscriptionOfferSchema);
