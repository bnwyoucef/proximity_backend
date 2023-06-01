const {ONE_SIGNAL_CONFIG} = require("../config/app.config") ;
const Notification = require('../models/Notification');
const OneSignal = require('@onesignal/node-onesignal');

const https = require("https") ; 

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
		notification.data = {type : "order" , id : "order_id" };
		notification.contents = {
			en: req.body.message ,
			fr: req.body.message
		};
		notification.headings = {
		  en: "Proximity App" ,
		  fr: "Proximity App Fransh"
		}
		await client.createNotification(notification).then(res => {
			console.log("success") ; 
			console.log(res) ;
		}).catch(err => {
			console.log("error") ; 
			console.log(err) ;
		});


		// var headers = {
		// 	"Content-Type" : "application/json; charset=utf-8" , 
		// 	"Authorization" : "Basic "+ONE_SIGNAL_CONFIG.API_KEY , 
		// } ; 

		// var options = {
		// 	host : "onesignal.com" , 
		// 	port : 443 , 
		// 	path : "/api/v1/notifications" , 
		// 	method : "POST" , 
		// 	headers : headers
		// } ;

		// var req = http.request(options , function(res) {
		// 	 res.on("data" , (data) => {
		// 		console.log(JSON.parse(data)) ;
		// 	 }) ; 

		// } ) ;
		
	} catch (error) {
		throw Error(error);
	}
};

//update notification
exports.updateNotification = async (req) => {
	try {
		
	} catch (error) {
		throw Error(error);
	}
};
