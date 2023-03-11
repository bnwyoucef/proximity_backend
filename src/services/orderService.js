const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Store = require('../models/Store');
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const { check } = require('prettier');

//create order
exports.createOrder = async (req) => {
	try {
		let order = req.body ; 
		// check store 
		const store = await Store.findById(order.storeId) ; 
		if(!store) {
			throw new Error('Store not found');
		}
		
		const seller = await User.findById(store.sellerId) ; 
		if(!seller) {
			throw new Error('Seller not found');
		}
		let auto_validation = false ; 
		//check items (variant) [discount , price , policy{ reservation , pickUp , delivery , validation }]
		// and calculate totals 
		let products_ids = order.items.map(el => el.productId) ;
		if(!products_ids && products_ids.length == 0) {
			throw new Error("Missed Order Items");
		}
		products_ids = [...new Set(products_ids)] ;
		let products = await Store.find({_id :  { $in: products_ids }}) ; 
		if(!products || products.length == 0 ){
			throw new Error("Products not found");
		}
		products = products.map(el => el._doc) ;

		order.items.forEach((item , index) => {
			//check item if exist in products 
			if(products.filter(el => el._id == item.productId).length == 0 ) {
				throw("Product not found") ;
			}
			let item_product = products.filter(el => el._id == item.productId)[0] ;
			//check variant 
			if(item_product.variants.filter(el => el._id == item.variantId).length == 0 ) {
				throw("["+item_product.name+" ] : variant not found") ;
			}

			let variant_product = item_product.variants.filter(el => el._id == item.variantId)[0] ; 


			// product policy
			if(!item_product.policy) {
				if(!store.policy) {item_product.policy = seller.policy ;} else {item_product.policy = store.policy ;}  
			}
			if(!item_product.policy) {throw("["+item_product.name+" ] : Policy not found") ;}

			// auto validation checks

			if( item_product.policy.order.validation.auto ) {
				// check price
				if(variant_product.price != item.price) { throw("Price Variant Error") ;}
				
				// check quantity
				if(variant_product.quantity < item.quantity){ throw("["+item_product.name+" ] : insufficient stock") ;}
			
			} 

			//init amount 
			order.items[index].amount = 0 ;
			order.items[index].total = variant_product.price*item.quantity ;


			//check order policy
			//check reservation
			if(order.reservation ) {
				if(!item_product.policy.reservation) throw("["+item_product.name+" ] : Reservation is not allowed") ;
				if(item_product.policy.reservation.total) {
					order.items[index].amount = variant_product.price*item.quantity ;
				}else if(item_product.policy.reservation.partial.fixe) {
					order.items[index].amount = item_product.policy.reservation.partial.fixe*item.quantity ; 
				}else if(item_product.policy.reservation.partial.percentage) {
					order.items[index].amount = (variant_product.price*item_product.policy.reservation.partial.percentage)*item.quantity ; 
				}
			} 
			//check pickup
			if(order.pickup ) {
				if(!item_product.policy.pickup) throw("["+item_product.name+" ] : Pickup is not allowed") ;
				order.items[index].amount = variant_product.price*item.quantity ;
			} 
			//check devlivery
			if(order.delivery ) {
				if(!item_product.policy.delivery) throw("["+item_product.name+" ] : Delivery is not allowed") ;
				let delivery_amount = item_product.policy.delivery.pricing.fixe ? item_product.policy.delivery.pricing.fixe
										: item_product.policy.delivery.pricing.km ? item_product.policy.delivery.pricing.km*order.delivery.nbrKm
										: 0
				order.items[index].amount = variant_product.price*item.quantity + delivery_amount ;
			} 
			



		});
		//check total 
		let total_amount = order.items.reduce(function (total, currentValue) {
			return total + currentValue.amount;
		}, 0) ; 

		let order_total_amount = order.paymentInfos.paymentAmount + (order.delivery ? order.delivery.shippingAmount : 0) ; 

		if(total_amount != order_total_amount ) throw("Payment Amount Error") ;
		if(order.items[0].total != order.paymentInfos.totalAmount ) throw("Total amount Error") ;

		// verification payment 
	
		//create order 

		const new_order = new Order({
			clientId : order.clientId ,
			storeId : order.storeId , 
			items : order.items.map(el => { const {total , amount , ...others} = el ;  return others }) , 
			paymentInfos : order.paymentInfos , 
			reservation : order.reservation , 
			pickup : order.pickup , 
			delivery : order.delivery , 
			canceled : null ,
		}) ; 

		await new_order.save() ;
		
	} catch (error) {
		
	}
};

//get the order by id
exports.getOrder = async (req) => {
	try {
		const order = await Order.findById(req.params.id);
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
//get order by user id
exports.getOrders = async (req) => {
	try {
		const order = await Order.find({ userId: req.params.id });
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
//get order by store id
exports.getOrdersByStore = async (req) => {
	try {
		const order = await Order.find({ storeId: req.params.id });
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
//get order by status
exports.getOrdersByStatus = async (req) => {
	try {
		const order = await Order.find({ status: req.params.status });
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
//get order by shipping status
exports.getOrdersByShippingStatus = async (req) => {
	try {
		const order = await Order.find({ shippingStatus: req.params.shippingStatus });
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
//get order by payment status
exports.getOrdersByPaymentStatus = async (req) => {
	try {
		const order = await Order.find({ paymentStatus: req.params.paymentStatus });
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
//get order by payment id
exports.getOrdersByPaymentId = async (req) => {
	try {
		const order = await Order.find({ paymentId: req.params.paymentId });
		if (!order) {
			throw new Error('order not found');
		}
		return order;
	} catch (err) {
		throw err;
	}
};
