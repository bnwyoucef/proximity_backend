const { string } = require('joi');
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ['Annual', 'Semi-annual', 'Quarterly', 'Monthly'],
			required: true,
			unique: false,
		},
		months: {
			type: Number,
			required: true,
			unique: false
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
