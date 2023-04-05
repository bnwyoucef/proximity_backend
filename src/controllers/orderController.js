var OrderService = require('../services/orderService');
exports.createOrder = async (req, res) => {
	try {
		const order = await OrderService.createOrderDirectly(req);
		res.send(order);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getOrders = async (req, res) => {
	try {
		const orders = await OrderService.getOrders(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getPreOrderItems = async (req, res) => {
	try {
		const orders = await OrderService.getPreOrderItems(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getOrder = async (req, res) => {
	try {
		const order = await OrderService.getOrder(req);
		res.send(order);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getOrdersByStore = async (req, res) => {
	try {
		const orders = await OrderService.getOrdersByStore(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.getOrdersPickUpByStatus = async (req, res) => {
	try {
		const orders = await OrderService.getOrdersPickUpByStatus(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};



exports.getOrdersDeliveryByStatus = async (req, res) => {
	try {
		const orders = await OrderService.getOrdersDeliveryByStatus(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.getOrdersReservationByStatus = async (req, res) => {
	try {
		const orders = await OrderService.getOrdersReservationByStatus(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getOrdersByShippingStatus = async (req, res) => {
	try {
		const orders = await OrderService.getOrdersByShippingStatus(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.getOrdersByPaymentStatus = async (req, res) => {
	try {
		const orders = await OrderService.getOrdersByPaymentStatus(req);
		res.send(orders);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
