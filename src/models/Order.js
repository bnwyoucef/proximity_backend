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
		pickupPerson : {
			type : {
				name : {type : String, required: true } ,
				nif : {type : String, required: true } ,
			} , 
			default : null
		} ,
		deliveryAddresse : {
			type: {
				type: String,
				enum: ['Point'],
			},
			coordinates: [
				{
					type: Number,
				},
				{
					type: Number,
				},
			],
		},
		distance : {
			type : Number , default : null 
		} ,
		items: [
			{
				productId: { type: String, required: true },
				variantId: { type: String, required: true },
				name: { type: String, required: true },
				image: { type: String, required: true },
				price: { type: Number, required: true },
				discount: { type: Number, required: true },
				quantity: { type: Number, required: true, default: 1 },
				policy: policySchema,
				
			},
			{
				timestamp: true,
			},
		],

		paymentInfos : {
			totalAmount: { type: Number, required: true },
			deliveryAmount: { type: Number, required: true },
			reservationAmount: { type: Number, required: true },
			paymentMethodeId: { type: Number, required: true, },
			card : {
				cardNumber : { type: String, required: true },
				ccv: { type: String, required: true },
				expdate: { type: String, required: true, },
				name: { type: String, required: true },
				postalCode: { type: String, required: true },
				address_city: { type: String, required: true },
				address_line1: { type: String, required: true },
				address_line2: { type: String, required: true },
			} ,
		} ,
		reservation : { type : Boolean , required : true , default : null } ,
		pickUp : { type : Boolean , required : true , default : null } , 

		delivery : { type : Boolean , required : true , default : null } , 

		timeLimit :  { type : Number ,  default : null }  ,

		canceled : {
			byClient: { type: Boolean },
			motif: { type: String },
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
