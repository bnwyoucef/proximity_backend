const { string } = require('joi');
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ['Annual', 'Semi-annual', 'Quarterly', 'Monthly'],
			required: true,
			unique: true,
		},
		months: {
			type: Number,
			required: false,
			unique: true,
		},
		price: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ['active', 'suspended'],
			default: 'active',
		},

	},
	{}
);

module.exports = mongoose.model('Plan', planSchema);
