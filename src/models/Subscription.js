const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
	{
		paymentManagerId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'User',
		},
		storeId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Store',
		},
		planId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'Plan',
		},
		subscriptionOfferId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'SubscriptionOffer',
		},
		paymentAmount: {
			type: Number,
			required: true,
		},
		paymentTypeId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'PaymentType',
		},
		status: {
			type: String,
			enum: ['inactive', 'active', 'delayed', 'suspended'],
			default: 'inactive',
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		notes: [{ type: String }],
		subscriptionsHistory: [
			{
				paymentManagerId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'User',
				},
				planId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'Plan',
				},
				subscriptionOfferId: {
					type: mongoose.Schema.Types.ObjectId,
					required: false,
					ref: 'SubscriptionOffer',
				},
				paymentAmount: {
					type: Number,
					required: true,
				},
				status: {
					type: String,
					default: 'suspended',
				},
				startDate: {
					type: Date,
					required: true,
				},
				endDate: {
					type: Date,
					required: true,
				},
				notes: [{ type: String }],
			},
		],
	},
	{ toJSON: { virtuals: true } }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
