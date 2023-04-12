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
const { default: mongoose } = require('mongoose');

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


//create order
exports.createOrderDirectly = async (req) => {
	try {
		let orders = req.body.orders ; 
		console.log(orders);
		if(typeof orders === "string") {
			orders = JSON.parse(orders) ; 
		}else {
			orders = [] ; 
		}

		console.log(orders) ;
		
		orders  = await asyncMapCreateOrder(orders, myAsyncFuncCreateOrder);
		
		console.log(orders) ;
		
	} catch (error) {
		console.log(error) ;
		
	}
};


async function asyncMapCreateOrder(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
  }
  
// Example usage
async function myAsyncFuncCreateOrder(element) {
	try {
		
		const new_order = new Order({...element}) ; 
		await new_order.save() ;
		return new_order ; 
		
	} catch (error) {
		console.log(error);
		return null
	}
	
}

  

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
		let order = [] ; 
		if(req.params.id) {
			let user = await User.findById(req.params.id) ; 
			if(user && user.role == "user") {
				order = await Order.find({ clientId : req.params.id ,   status: req.params.status });
			}else if(user && user.role == "seller") {
				// get stores ids 
				let stores = await Store.find({sellerId : req.params.id}) ; 
				if (stores && stores.length ) {
					stores = stores.map(el => el._doc._id) ;
				}else {
					stores = [] ; 
				}
		
				order = await Order.find({ storeId : {$in : stores } ,  status: req.params.status });

			}
			if (!order) {
				throw new Error('order not found');
			}
	
			order  = await asyncMapOrder(order, myAsyncFuncOrder);
			console.log(order);

		}

		return order;
	} catch (err) {
		throw err;
	}
};
exports.getOrdersPickUpByStatus = async (req) => {
	try {
		let order = [] ; 
		if(req.params.id) {
			let user = await User.findById(req.params.id) ; 
			if(user && user.role == "user") {
				order = await Order.find({ clientId : req.params.id ,  pickUp : true ,  status: req.params.status });
			}else if(user && user.role == "seller") {
				// get stores ids 
				let stores = await Store.find({sellerId : req.params.id}) ; 
				if (stores && stores.length ) {
					stores = stores.map(el => el._doc._id) ;
				}else {
					stores = [] ; 
				}
		
				order = await Order.find({ storeId : {$in : stores } , pickUp : true ,  status: req.params.status });

			}
			if (!order) {
				throw new Error('order not found');
			}
	
			order  = await asyncMapOrder(order, myAsyncFuncOrder);
			console.log(order);

		}

		return order;
	} catch (err) {
		throw err;
	}
};


exports.getOrdersDeliveryByStatus = async (req) => {
	try {
		let order = [] ; 
		if(req.params.id) {
			let user = await User.findById(req.params.id) ; 
			if(user && user.role == "user") {
				order = await Order.find({ clientId : req.params.id ,  delivery : true ,  status: req.params.status });
			}else if(user && user.role == "seller") {
				// get stores ids 
				let stores = await Store.find({sellerId : req.params.id}) ; 
				if (stores && stores.length ) {
					stores = stores.map(el => el._doc._id) ;
				}else {
					stores = [] ; 
				}
		
				order = await Order.find({ storeId : {$in : stores } , delivery : true ,  status: req.params.status });

			}
			if (!order) {
				throw new Error('order not found');
			}
	
			order  = await asyncMapOrder(order, myAsyncFuncOrder);
			console.log(order);

		}
		return order;
	} catch (err) {
		throw err;
	}
};
exports.getOrdersReservationByStatus = async (req) => {
	try {
		let order = [] ; 
		if(req.params.id) {
			let user = await User.findById(req.params.id) ; 
			if(user && user.role == "user") {
				order = await Order.find({ clientId : req.params.id ,  reservation : true ,  status: req.params.status });
			}else if(user && user.role == "seller") {
				// get stores ids 
				let stores = await Store.find({sellerId : req.params.id}) ; 
				if (stores && stores.length ) {
					stores = stores.map(el => el._doc._id) ;
				}else {
					stores = [] ; 
				}
		
				order = await Order.find({ storeId : {$in : stores } , reservation : true ,  status: req.params.status });

			}
			if (!order) {
				throw new Error('order not found');
			}
	
			order  = await asyncMapOrder(order, myAsyncFuncOrder);
			console.log(order);

		}
		return order;
	} catch (err) {
		throw err;
	}
};


async function asyncMapOrder(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
  }
  
// Example usage
async function myAsyncFuncOrder(element) {
	var returnedItem = {...element._doc , store : null , seller : null , client : null } ;
	try {
		
		// get stores (name, addresse )
		
		var store = await Store.findById(returnedItem.storeId);
		if (store) {
			let {name , address , location , image , ...others} = store ; 
			returnedItem.store = {name , address , location , image} ;
			// get sellers (phone)
			var seller = await User.findById(store.sellerId);
			if (seller) {
				let {phone , email  , ...others} = seller ; 
				returnedItem.seller = {phone , email } ;
			}
		}
		
		var user = await User.findById(element.clientId);
		returnedItem.user = user ; 

		return returnedItem ; 
		
	} catch (error) {
		console.log(error);
		return {...element._doc , store : null , seller : null , client : null}
	}
	
}

  
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



//get pre Order items
exports.getPreOrderItems = async (req) => {
	try {
		var PreOrder = {
			storeId : null , 
			cartId : null , 
			storeName : "" ,
			maxDeliveryFixe : 0.0 ,
			maxDeliveryKm : 0.0 , 
			storeAdresse : [] , // location
			items : [] , // array of preOrderItem
		}

		var preOrderItem =  {
			productId : null  ,
			variantId : null , 
			name : "" , 
			characterstics : [] ,
			discount : 0.0 , 
			image : "" , 
			price : 0.0 , 
			quantity : 0 ,
			policy : null 
			// policies
			// reservationPolicy : false ,  
			// deliveryPolicy : false ,  
			// pickupPolicy : false ,  
			// // percentage
			// reservationP : 0.0 ,   
		}

		// check cart !!
		var cart = await Cart.findById(req.body.cartId);
		if (!cart) {
			console.log(req.body.clientId);
			 cart = await Cart.findOne({userId : mongoose.Types.ObjectId(req.body.clientId) , });
			if (!cart) {
				throw new Error('cart not found');
			}
		}

		PreOrder.cartId = req.body.cartId ; 

		// check store 
		// pas du store au niveau du backend 

		// check items and get current values 
		var items = [] ; 
		if(typeof req.body.items === "string" && req.body.items != "" ) {
			items = JSON.parse(req.body.items);
		} ;
		if(items.length) {

			// check if all items in cart 
			var itemIds = items.map(el => el.variantId) ;
			console.log(cart);

			var filterItems = cart.items.filter(el => itemIds.includes(el.variantId)  ) ;

			if(filterItems.length !== items.length) {
				throw new Error('Order without same items of the cart');
			}

			// get first variant and store 
			var firstProduct = await Product.findOne({ 'variants._id': items[0].variantId }) ; 
			if(!firstProduct) {
				throw new Error('Store not found');
			}
			var store = await Store.findById(firstProduct.storeId) ; 
			if(!store) {
				throw new Error('Store not found');
			}
			PreOrder.storeId = store._id.toString() ; 
			PreOrder.storeName = store.name ; 
			PreOrder.storeAdresse = store.location ; 
		}else {
			throw new Error('items not found');
		}

		items  = await asyncMapPreOrderItems(items, myAsyncFuncPreOrderItems);

		//get max delivery pricing 

		var maxDeliveryKm = items.reduce((max, item) => {
			return item.deliveryP > max ? item.deliveryP : max;
		  }, 0.0);
		PreOrder.maxDeliveryKm = maxDeliveryKm ; 

		var maxDeliveryFixe = items.reduce((max, item) => {
			return item.deliveryFixe > max ? item.deliveryFixe : max;
		  }, 0.0);
		PreOrder.maxDeliveryFixe = maxDeliveryFixe ; 
		  
		PreOrder.items = JSON.stringify(items) ;

		console.log(PreOrder);
		return PreOrder;
	} catch (err) {
		console.log(err);
		throw err;
	}
};


async function asyncMapPreOrderItems(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
  }
  
// Example usage
async function myAsyncFuncPreOrderItems(element) {
	var returnedItem = {
		error : "Product not found"
	} ;
	try {
		// get the item 
	
		var product = await Product.findOne({ "variants._id": mongoose.Types.ObjectId(element.variantId) }) ; 
		if(product) {
			var productVariant = product.variants.find((item) => item._id.toString() ===  element.variantId ) ;
			if(productVariant) {
				// check disponibilité 	
				if(productVariant.quantity != parseInt(element.orderQuantity)) {
					returnedItem = {
						error : "Product not disponible"
					}
				}
				// get item policy
				if(!product.policy) {
					product.policy = null ;
					let store = await Store.findById(product.storeId) ;
					if(!(store && store.policy)) {
							let seller = await User.findById(product.sellerId) ;
							console.log(seller._id);
							if(seller && seller.policy) {
								product.policy = seller.policy ;
							}else {
								product.policy = null
							}
					}else {
						product.policy = store.policy  ;
					}
				}
				console.log(productVariant.characterstics);
				returnedItem = {
					id : productVariant._id ,
					productId : product._id , 
					variantId : productVariant._id , 
					name : product.name ,
					characterstics : productVariant.characterstics ,
					image : productVariant.img , 
					price : productVariant.price , 
					quantity : parseInt(element.orderQuantity) , 
					discount : product.discount , 
					reservationPolicy: product.policy && product.policy.reservation && product.policy.reservation.payment ,
					deliveryPolicy:  product.policy && product.policy.delivery && product.policy.delivery.pricing ,
					pickupPolicy:  product.policy && product.policy.pickup && product.policy.pickup.timeLimit ,
					reservation: false,
					delivery: !(product.policy && product.policy.pickup && product.policy.pickup.timeLimit != null) ,
					pickup: product.policy && product.policy.pickup && product.policy.pickup.timeLimit != null ,
					reservationP: product.policy && product.policy.reservation && product.policy.reservation.payment && !product.policy.reservation.payment.free ?
								 product.policy.reservation.payment.total ? 1 
								 : product.policy.reservation.payment.partial && product.policy.reservation.payment.partial.percentage ? product.policy.reservation.payment.partial.percentage / 100 
								 : product.policy.reservation.payment.partial && product.policy.reservation.payment.partial.fixe ? product.policy.reservation.payment.partial.fixe : 0.0
								 : 0.0 ,
					deliveryP: product.policy && product.policy.delivery && product.policy.delivery.pricing && product.policy.delivery.pricing.km ?
								product.policy.delivery.pricing.km
								: 0.0 ,
					deliveryFixe: product.policy && product.policy.delivery && product.policy.delivery.pricing && product.policy.delivery.pricing.fixe ?
								product.policy.delivery.pricing.fixe
								: 0.0 ,
				}

			}

		}
		return returnedItem ; 
		
	} catch (error) {
		console.log(error);
		return {
			error : "Product Not found"
		}
	}
	
}

  