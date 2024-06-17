const PaymentType = require('../models/PaymentType');

// get all payment types
exports.getPaymentTypes = async (req) => {
	try {
		const types = await PaymentType.find();
		return types;
	} catch (error) {
		throw error;
	}
};

// create a new payment type
exports.createPaymentType = async (req) => {
	try {
		const newPaymentType = new PaymentType({
			type: req.body.type,
		});
		await newPaymentType.save();
		return newPaymentType;
	} catch (error) {
		throw error;
	}
};

// update a payment type
exports.updatePaymentType = async (req) => {
	try {
		const paymentType = await PaymentType.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!paymentType) throw Error('The Payment type with the given ID was not found.');
		return paymentType;
	} catch (error) {
		throw error;
	}
};

// delete a payment type
exports.deletePaymentType = async (req) => {
	try {
		await PaymentType.findByIdAndDelete(req.params.id);
		return { message: 'Payment type deleted successfully' };
	} catch (error) {
		throw error;
	}
};
