const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			unique: true,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{}
);

module.exports = mongoose.model('Plan', planSchema);
