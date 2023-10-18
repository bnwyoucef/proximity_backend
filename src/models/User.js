const mongoose = require('mongoose');
const { policySchema } = require('./Policy');
var ObjectId = require('mongodb').ObjectID;

const userSchema = new mongoose.Schema(
	{
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: 8,
			validate(value) {
				if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
					throw new Error('Password must contain at least one letter and one number');
				}
			},
		},
		username: {
			type: String,
			unique: true,
		},
		role: {
			type: String,
			enum: ['user', 'admin', 'seller'],
			default: 'user',
		},
		isAdmin: { type: Boolean, default: false },
		companyName: {
			type: String,
		},
		phone: {
			type: String,
			default : null
		},

		verificationCode: {
			type: String,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		welcome: {
			type: Boolean,
			default: false,
		},
		profileImage: {
			type: String,
		},
		discountCode: {
			type: String,
		},
		email: {
			type: String,
			default : null
		},
		favouritsProductst: [
			{
				productId: { type: String },
			},
		],
		adresse: {
			latitude: { type: Number },
			longitude: { type: Number },
			countryCode: { type: String },
			country: { type: String },
			city: { type: String },
			postalCode: { type: String },
			locality: { type: String },
			apartmentNumber: { type: String },
			streetName: { type: String },
			region: { type: String },
			fullAddress: { type: String },
		},
		policy: policySchema ,
		shippingAdress: {
			countryCode: { type: String },
			country: { type: String },
			city: { type: String },
			postalCode: { type: String },
			locality: { type: String },
			apartmentNumber: { type: String },
			streetName: { type: String },
			region: { type: String },
			fullAddress: { type: String },
		},
		proximityRange: {
			type: Number,
			default: 20,
		},
		storeCategorieIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'StoreCategory',
			},
		],
		productCategorieIds: [
			{
				categoryId : {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Category',
				} , 
				subCategories : [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Category.subCategories',
					}
				]
			},
		],
		tags: [
			{
				name: {
					type: String,
					required: true,
				}
			},
		],
		notification : {
			orderNotifications :{type : Boolean ,  default : null} , 
			offerNotification :{type : Boolean ,  default : null} , 
			mail :{type : Boolean ,  default : null} , 
			sms :{type : Boolean ,  default : null} , 
			platforme :{type : Boolean ,  default : null} , 
			popup :{type : Boolean ,  default : null} , 
			vibration :{type : Boolean ,  default : null} , 
			ringing :{type : Boolean ,  default : null} , 
		} , 
		
		pickupPersons: [
			{
				type : {
					name : {type : String, required: true } 
				} 
			},
		],
		addresses : [
			{
				type : {
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
					
				}
			}
		] , 
		cards : [
			{
				type : {
					cardNumber : { type: String,  default : null },
					ccv: { type: String, default : null },
					expdate: { type: String, default : null},
					name: { type: String, required: true },
					phone: { type: String, required: true },
					postalCode: { type: String, required: true },
					address_city: { type: String, required: true },
					address_line1: { type: String, required: true },
					address_line2: { type: String, default: ""},
				}
			}
		]

	},
	

	{ timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);
