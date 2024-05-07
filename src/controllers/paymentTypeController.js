const PaymentTypeService = require('../services/paymentTypeService');

// get all payment types
exports.getPaymentTypes = async (req, res) => {
	try {
		const types = await PaymentTypeService.getPaymentTypes(req.params.planId);
		res.send(types);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
// create a new payment type
exports.createPaymentType = async (req, res) => {
	try {
		const newPaymentType = await PaymentTypeService.createPaymentType(req);
		res.send(newPaymentType);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// update a payment type
exports.updatePaymentType = async (req, res) => {
	try {
		const paymentType = await PaymentTypeService.updatePaymentType(req);
		res.send(paymentType);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// delete a payment type
exports.deletePaymentType = async (req, res) => {
	try {
		const message = await PaymentTypeService.deletePaymentType(req);
		res.send(message);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
