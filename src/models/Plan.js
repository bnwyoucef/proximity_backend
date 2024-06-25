const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			unique: false,
			validate: {
				validator: function (value) {
					const predefinedTypes = ['Annual', 'Semi-annual', 'Quarterly', 'Monthly'];
					return predefinedTypes.includes(value) || /^[a-zA-Z\s]+$/.test(value);
				},
				message: props => `${props.value} is not a valid plan type!`
			}
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
		reductionOffers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'ReductionOffer'
			}
		],
		status: {
			type: String,
			enum: ['active', 'suspended'],
			default: 'active',
		},

	},
	{}
);

module.exports = mongoose.model('Plan', planSchema);
