const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Store',
			required: true,
		},
		offerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Offer',
			required: true,
			unique: true,
		},
		seend : { type : Boolean ,  default : false }  ,
		type: { type: String, required: true, enum: [
														'Order', 
														'Return',  
														'Refund', 
														'Reservation', 
														'Offer', 
													], default: '' }, 
	},
	{
		timestamp: true,
		toJSON: { virtuals: true },
	}
);

module.exports = mongoose.model('Notification', NotificationSchema);
