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
		deliveryLocation : {
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
		deliveryAddresse : {
			city: {
				type: String,
				// required: true,
			},
			streetName: {
				type: String,
				//required: true,
			},
			postalCode: {
				type: String,
				//required: true,
			},
			country: {
				type: String,
				//required: true,
			},
			fullAdress: {
				type: String,
				//required: true,
			},
			region: {
				type: String,
				//required: true,
			},
			countryCode: {
				type: String,
				//required: true,
			},
			phone: {
				type: String,
				//required: true,
			},
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
				reservation: { type: Number},
				quantity: { type: Number, required: true, default: 1 },
				policy: policySchema,

				refund : {
					order : {
						fixe : {type : Number ,  default : null} ,
						percentage : {type : Number ,  default : null} ,
					} , 
					shipping : {
						fixe : {type : Number ,  default : null} ,
						percentage : {type : Number ,  default : null} ,
					},
				} , 
				
			},
			{
				timestamp: true,
			},
		],

		
		returnItems: [
			{
				productId: { type: String, required: true },
				variantId: { type: String, required: true },
				name: { type: String, required: true },
				image: { type: String, required: true },
				price: { type: Number, required: true },
				discount: { type: Number, required: true },
				quantity: { type: Number, required: true, default: 1 },
				orderQuantity: { type: Number, required: true, default: 1 },
				policy: policySchema,

				refund : {
					order : {
						fixe : {type : Number ,  default : null} ,
						percentage : {type : Number ,  default : null} ,
					} , 
					shipping : {
						fixe : {type : Number ,  default : null} ,
						percentage : {type : Number ,  default : null} ,
					},
				} , 
				
			},
			{
				timestamp: true,
			},
		],
		returnMotif :{ type: String ,  default : null },

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
		

		return : { type : Boolean ,  default : null } , 
		

		refund : { type : Boolean ,  default : null } , 

		timeLimit :  { type : Number ,  default : null }  ,

		canceled : { type : Boolean ,  default : null } , 
		canceledBy : {
			userId: { type: mongoose.Schema.Types.ObjectId },
			motif: { type: String },
		} ,
		status: { type: String, required: true, enum: [
														'Pending', 
														'InPreparation',  
														'LoadingDelivery', 
														'OnTheWay', 
														'Delivered', 
														'AwaitingRecovery', 
														'Recovered', 
														'Reserved', 
														'WaitingForReturn', 
														'Returned', 	
														'UnderRefund' ,
														'Refunded', 
														'succeeded'
													], default: 'Pending' }, 
	},
	{ timestamp: true }
);
module.exports = mongoose.model('Order', orderSchema);
