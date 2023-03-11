const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

const { policySchema } = require('./Policy');
const orderSchema = new mongoose.Schema(
	{
		clientId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		storeId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Store',
		},
		items: [
			{
				productId: { type: String, required: true },
				variantId: { type: String, required: true },
				name: { type: String, required: true },
				image: { type: String, required: true },
				price: { type: Number, required: true },
				discountPrice: { type: Number, required: true },
				quantity: { type: Number, required: true, default: 1 },
				policy: policySchema,
				
			},
			{
				timestamp: true,
			},
		],

		paymentInfos : {
			totalAmount: { type: Number, required: true },
			paymentAmount: { type: Number, required: true },
			paymentMethodeId: { type: Number, required: true, },
			card : {
				ccv: { type: String, required: true },
				secretCode: { type: String, required: true },
				exp_month: { type: Number, required: true, },
				exp_year: { type: Number, required: true, },
				name: { type: String, required: true },
				country: { type: String, required: true },
				address_city: { type: String, required: true },
				address_line1: { type: String, required: true },
				address_line2: { type: String, required: true },
			} ,
		} ,
		reservation : { type : Boolean , required : true , default : null } ,
		pickUp : { type : Boolean , required : true , default : null } , 

		delivery : {
			shippingAmount: { type: Number, required: true },
			nbrKm: { type: Number },
		} ,
		canceled : {
			byClient: { type: Boolean, required: true },
			motif: { type: String, required: true },
		} ,
		status: { type: String, required: true, enum: [
														'Pending', 
														'In preparation',  
														'Loading delivery', 
														'On the way', 
														'delivered', 
														'Awaiting Recovery', 
														'Recovered', 
														'Awaiting finalization', 
														'Return processing', 
														'Waiting for return', 
														'Under refund' ,
														'Refunded', 
														'Canceled', 
														'succeeded'
													], default: 'Pending' }, 
	},
	{ timestamp: true }
);
module.exports = mongoose.model('Order', orderSchema);
