const {ONE_SIGNAL_CONFIG} = require("../config/app.config") ;
const Notification = require('../models/Notification');
const OneSignal = require('@onesignal/node-onesignal');

const { sendMail } = require('../middleware/email');
const https = require("https") ; 
const User = require("../models/User");
const Product = require("../models/Product");
const Store = require("../models/Store");

const app_key_provider = {
    getToken() {
        return ONE_SIGNAL_CONFIG.API_KEY;
    }
};

//create notification
exports.createNotification = async (req) => {
	try {
		
	} catch (error) {
		throw Error(error);
	}
};

//send notification
exports.sendNotification = async (req) => {
	try {
		console.log(req.body) ;
		const user_key_provider = {
			getToken() {
				return ONE_SIGNAL_CONFIG.USER_AUTH;
			}
		};
		const app_key_provider = {
			getToken() {
				return ONE_SIGNAL_CONFIG.API_KEY;
			}
		};
		const configuration = OneSignal.createConfiguration({
			authMethods: {
				user_key: {
					tokenProvider: user_key_provider
				},
				app_key: {
					tokenProvider: app_key_provider
				}
			}
		});
		const client = new OneSignal.DefaultApi(configuration);

		const notification = new OneSignal.Notification();
		notification.app_id = ONE_SIGNAL_CONFIG.APP_ID;
		notification.included_segments = ['Subscribed Users'];
		notification.data = {
				owner_id : [
					"6430802a2e63b8a9ea099b7a"
				] , 
				type : "order" , // order or offer
				sub_type : "Return" , // for the icon
				id : "6430877d2e63b8a9ea099ef6" // get order or offer and go to the page 
			};
		notification.contents = {
			en: "Abdennour has requested a return" ,
			fr: "Abdennour has requested a return"
		};
		notification.headings = {
		  en: "Return Request" ,
		  fr: "Return Request"
		}
		await client.createNotification(notification).then(res => {
			console.log("success") ; 
			console.log(res) ;
		}).catch(err => {
			console.log("error") ; 
			console.log(err) ;
		});
		
	} catch (error) {
		throw Error(error);
	}
};

exports.localSendNotification = async ( title , content , data , ) => {
	try {
		// initialisation 
		const user_key_provider = {
			getToken() {
				return ONE_SIGNAL_CONFIG.USER_AUTH;
			}
		};
		const app_key_provider = {
			getToken() {
				return ONE_SIGNAL_CONFIG.API_KEY;
			}
		};
		const configuration = OneSignal.createConfiguration({
			authMethods: {
				user_key: {
					tokenProvider: user_key_provider
				},
				app_key: {
					tokenProvider: app_key_provider
				}
			}
		});
		const client = new OneSignal.DefaultApi(configuration);
		const notification = new OneSignal.Notification();
		notification.app_id = ONE_SIGNAL_CONFIG.APP_ID;
		notification.included_segments = ['Subscribed Users'];
		let sendNotification = false ;
		let sendedNotification = false ;

		// traitement du data
	
		if (data != null) {
			for (let index = 0; index < data.owner_id.length; index++) {
				const element = data.owner_id[index].toString();
				console.log(element) ; 
				let user = await User.findById(element) ; 
				console.log(user) ; 
				console.log(user && ((user.role == "user" && user.notification && user.notification.orderNotifications) 
				|| (user.role== "seller" && user.policy != null && user.policy.order && user.policy.order.notification && user.policy.order.notification.sendMode  && user.policy.order.notification.sendMode.mail)) 
			&& data.type == "order")  ;
				// order notification 
				if(user && ((user.role == "user" && user.notification && user.notification.orderNotifications) 
							|| (user.role== "seller" && user.policy != null && user.policy.order && user.policy.order.notification && user.policy.order.notification.sendMode  && user.policy.order.notification.sendMode.mail)) 
						&& data.type == "order") {

					// envoie des emails
					if((user.notification.mail || user.policy.order.notification.sendMode.mail )&& user.email && user.email != "") {
						// send the mail 
						console.log((user.role == "user" && user.notification.popup) || (user.role == "seller" && user.policy.order.notification.sendMode.popup)) ;
						if((user.role == "user" && user.notification.popup) || (user.role == "seller" && user.policy.order.notification.sendMode.popup)) {
							sendNotification = true ; 
						}
						sendedNotification = true ;
						const emailTemplate = `
								<h1>Hello ${user.username},</h1>
								<p>${content}.</p>
								<a href="https://www.proximity.com/orders/${data.id}">
									<button style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; border: none;">
									View Order in app
									</button>
								</a>
							`;
						sendMail(
							user.email,
							'Order Progress : '+title+' ['+data.id+']' ,
							emailTemplate , 
							true
						);
					}
					if(user.notification.sms && user.phone && user.phone != "") {
						// send SMS
					}
					
				}
				let productImage = "" ; 
				let productDiscount ="" ; 
				// offer notification 
				if(user && user.notification && user.notification.offerNotification && data.type == "offer") {
					// get product 
					let product = await Product.findById(data.id) ; 
					if(product) {
						// envoie des emails
						if(user.notification.mail && user.email && user.email != "") {
							// send the mail 
							if(user.notification.popup) {
								sendNotification = true ; 
							}
							sendedNotification = true ; 
							let buttonName = data.sub_type == "offer" ? "View Offer in the app" : "View product in the app" ;
							// productImage = product && product.images && product.images.length ? "http://192.168.54.136:5000/"+product.images[0] : "" ;
							productImage = "https://c0.lestechnophiles.com/images.frandroid.com/wp-content/uploads/2021/09/apple-iphone-13-pro-max-frandroid-2021-768x768.png" ;
							productDiscount = product.discount*100 ; 
							let discountDiv = data.sub_type == "offer" ? 
											`
												<div style="position : absolute ; top : 5px ; right : 5px ;  padding : 5px 15px ; text-align : center ; border-radius : 5px ; background-color : red ;color : white ; width : max-content ">
													-${productDiscount}%
												</div>
											` 
											: "" ;
							const emailTemplate = `
									<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
										<h1>Hello ${user.username},</h1>
									</div>
									<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
										<p>${content}.</p>
									</div>
									<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
										${discountDiv}
										<img 
											src="${productImage}"
											style="width : 200px ; height : auto ;"
											alt="product image"
										/>
									</div>
									<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
										<a href="https://www.proximity.com/product/${data.id}">
											<button style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; border: none;">
											${buttonName}
											</button>
										</a>
									</div>
								`;
							sendMail(
								user.email,
								title ,
								emailTemplate , 
								true
							);
						}
						if(user.notification.sms && user.phone && user.phone != "") {
							// send SMS
						}

					}
					
				}
				console.log("sendedNotification") ; 
				console.log(sendedNotification) ; 
				if(sendedNotification) {
					let savedNotification = new Notification({
						owner_id : element ,
						title : title , 
						content : content , 
						id : data.id , 
						type : data.type , 
						sub_type : data.sub_type , 
						seend : false  , 
						seendInList : false ,
					}) ;
	
					savedNotification = await savedNotification.save() ; 
					console.log(notification) ; 
					
					notification.data = {...data , notification_id : savedNotification._id , product_image : productImage , product_discount : productDiscount } ;
				}
				
			}
		}


		// notification.data = {
		// 		owner_id : [
		// 			"6430802a2e63b8a9ea099b7a"
		// 		] , 
		// 		type : "order" , // order or offer
		// 		sub_type : "Return" , // for the icon
		// 		id : "6430877d2e63b8a9ea099ef6" // get order or offer and go to the page 
		// 	};
		console.log("sendNotification") ; 
		console.log(sendNotification) ; 
		if(sendNotification) {
			notification.contents = {
				en: content ,
				fr: content
			};
			notification.headings = {
			  en: title ,
			  fr: title
			}
			console.log("sendNotification") ;
			await client.createNotification(notification).then(res => {
				console.log("success") ; 
				console.log(res) ;
			}).catch(err => {
				console.log("error") ; 
				console.log(err) ;
			});

		}
		
	} catch (error) {
		console.log(error) ;
		throw Error(error);
	}
};
exports.shareProduct = async (req) => {
	try {
		let user = null ; 
		if(req.body.userId) {
			user = await User.findById( req.body.userId) ; 
		}
		if(!user) {
			throw Error('You must be authenticated!!');
		}		
		

		const product = await Product.findOne({ _id: req.params.id });
		if(!product) {
			throw Error('Product not found!!');
		}
		let productImage = "https://c0.lestechnophiles.com/images.frandroid.com/wp-content/uploads/2021/09/apple-iphone-13-pro-max-frandroid-2021-768x768.png" ;

		const emailTemplate = `
			<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
				<p>Hi, </p>
			</div>
			<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
				<p>${user.username} finds this product interesting and wants to share it with you.</p>
			</div>
			<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
				<img 
					src="${productImage}"
					style="width : 200px ; height : auto ;"
					alt="product image"
				/>
			</div>
			<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
				<h1>${product.name}</h1>
			</div>
			<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
				<p>${product.description} </p>
			</div>
			<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
				<a href="https://www.proximity.com/product/${product._id}">
					<button style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; border: none;">
						Go to the product page 
					</button>
				</a>
			</div>
		`;
		if(req.body.email) {
			sendMail(
				req.body.email,
				product.name ,
				emailTemplate , 
				true
			);
		}else {
			throw Error('You must enter a destination email!!');

		}
		
	} catch (error) {
		throw Error('Error');
	}
}
exports.shareStore = async (req) => {
	try {
		let user = null ; 
		if(req.body.userId) {
			user = await User.findById( req.body.userId) ; 
		}
		if(!user) {
			throw Error('You must be authenticated!!');
		}
		let userName = user.username ; 
		
		

		const store = await Store.findOne({ _id: req.params.id });
		if(!store) {
			throw Error('Store not found!!');
		}
		// let storeImage = store.image ? store.image  : "" ;
		let storeImage = "https://www.apple.com/newsroom/images/environments/stores/standard/Apple_Changsha_NewStore_09012021_Full-Bleed-Image.jpg.large.jpg" ; 
		
		const emailTemplate = `
				<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
					<p>Hi, </p>
				</div>
				<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
					<p>${user.username} finds this store interesting and wants to share it with you.</p>
				</div>
				<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
					<img 
						src="${storeImage}"
						style="width : 200px ; height : auto ;"
						alt="store image"
					/>
				</div>
				<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
					<h1>${store.name}</h1>
				</div>
				<div style="position : relative ; width : 100% ; display : flex ; align-items : center : justify-content : center">
					<p>${store.description} </p>
				</div>
				<div style="width : 100% ; display : flex ; align-items : center : justify-content : center">
					<a href="https://www.proximity.com/store/${store._id}">
						<button style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; border: none;">
							Go to the store page 
						</button>
					</a>
				</div>
			`;
		if(req.body.email) {
			sendMail(
				req.body.email,
				store.name ,
				emailTemplate , 
				true
			);
		}else {
			throw Error('You must enter a destination email!!');

		}
		
	} catch (error) {
		throw Error('Error');
	}
}


exports.updateNotificationsUser = async (req) => {
	try {
		console.log(req.body);
		const user = await User.findById(req.params.id);
		if (!user) {
			throw new Error({ message: 'User not found' });
		} else {
			const updatedNotifications = await Notification.updateMany(
				{owner_id : user._id},
				{
					$set: req.body,
				},
				{ new: true }
			);
			return updatedNotifications;
		}
	} catch (err) {
		throw err;
	}
};

exports.updateNotification = async (req) => {
	try {
		console.log(req.body);
		if (!req.params.id) {
			throw new Error({ message: 'notification not found' });
		} else {
			const updatedNotifications = await Notification.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			);
			return updatedNotifications;
		}
	} catch (err) {
		throw err;
	}
};

exports.getUserNotifications = async (req) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			throw new Error({ message: 'User not found' });
		} else {
			const notifications = await Notification.find(
				{owner_id : user._id}
			).sort({createdAt : -1});
			return notifications;
		}
	} catch (err) {
		throw err;
	}
};
