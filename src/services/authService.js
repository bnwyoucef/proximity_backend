const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
var User = require('../models/User');
const { sendMail } = require('../middleware/email');

var axios = require('axios');


exports.register = async (userInfo) => {
	try {
		const random = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
		if(userInfo.email && userInfo.email != "" ) {
			const userEmail = await User.findOne({ email: userInfo.email });
			if (userEmail) {
				throw new Error('Email already exists !');
			}
			
		}else if(userInfo.phone && userInfo.phone != "") {
			const userphone = await User.findOne({ phone: userInfo.phone });
			if (userphone) {
				throw new Error('Phone number already exists !');
			}
		}else {
			throw new Error('You must enter an email or a phone number !');
		}

		const username = await User.findOne({ username: userInfo.username });
		if (username) {
			throw new Error('Username already exists !');
		}

		if(!(userInfo.password && userInfo.password_confirmation && userInfo.password == userInfo.password_confirmation)) {
			throw new Error('The password and its confirmation are not the same');
		}

		const newUser = new User({
			email: userInfo.email,
			phone: userInfo.phone ,
			username : userInfo.username , 
			password: userInfo.password,
			role: userInfo.role,
			verificationCode: random,
		});
		newUser.password = CryptoJS.AES.encrypt(newUser.password, process.env.ACCESS_TOKEN_SECRET).toString();
		try {
			if(newUser.email) {
				sendMail(
					newUser.email,
					'Welcome to SmartCity',
					'Welcome ' +
						newUser.email.split('@')[0] +
						' You have successfully registered to the app your account is now active you can login to the app ' +
						'' +
						' your verification code is ' +
						random +
						' ' +
						' your email is ' +
						userInfo.email 
				);
			}else if (newUser.phone) {
				var phone_to = newUser.phone.substring(1) ;
				var data = JSON.stringify({
					"message": ' your verification code is ' +random,
					"to": phone_to ,
					"sender_id": "Proximity"
				  });
				  
				  var config = {
					method: 'post',
					url: 'https://api.sms.to/sms/estimate',
					headers: { 
					  'Authorization': 'Bearer '+process.env.SMSTO_API_KEY, 
					  'Content-Type': 'application/json'
					},
					data : data
				  };
				  
				  axios(config)
				  .then(function (response) {
					console.log(JSON.stringify(response.data));
				  })
				  .catch(function (error) {
					console.log(error);
				  });
				  
			}
			
		} catch (err) {
			throw err;
		}
		const savedUser = await newUser.save();
		return savedUser;
	} catch (err) {
		throw err;
	}
};

//LOGIN
exports.login = async (userInfo) => {
	try {
		let user = await User.findOne({ email: userInfo.email });
		if(!user) {
			user = await User.findOne({ phone: userInfo.email });
		}
		if(!user) {
			user = await User.findOne({ username: userInfo.email });
		}

		if (user) {
			const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.ACCESS_TOKEN_SECRET).toString(CryptoJS.enc.Utf8);
				const inputPassword = userInfo.password;
				if (hashedPassword === inputPassword) {
					const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
					if(user.role != userInfo.role) {
						return {
							success : false , 
							message : "Permission denied" , 
							data : 3
						};
					}
					if (!user.isVerified) {
						return {
							success : false , 
							message : "Account not verified" , 
							data : 4
						};
					}
					return {
						success : true , 
						message : "" , 
						data : {
							token,
							user: {
								id: user._id,
								email: user.email,
								role: user.role,
								username: user.username,
								welcome : user.welcome ? user.welcome : false 
							}
						}
					};
				} else {
					return {
						success : false , 
						message : "password is incorrect" , 
						data : 2
					};
				}
		} else {
			return {
				success : false , 
				message : "user is not registered" , 
				data : 1
			};
		}
	} catch (err) {
		throw err;
	}
};

//VERIFY
exports.verify = async (req) => {
	try {
		const user = await User.findOne({ email: req.email });
		if (!user) throw new Error('Wrong User Name');
		if (user.verificationCode == req.verificationCode) {
			user.isVerified = true;
			user.save();
			const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
			try {
				sendMail(user.email, 'Registration Completed', 'Your email is Now Verified');
			} catch (err) {
				console.log(err);
			}
			return {
				success : true , 
				message : 'hello ' + user.email + ' your email is now verified' , 
				data : {
					token,
					user: {
						id: user._id,
						email: user.email,
						role: user.role,
						username: user.username,
					}
				}
			};
		} else {
			throw Error('User code incorrect');
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};


//VERIFY
exports.resend_verification_code = async (userInfo) => {
	try {
		var user = await User.findOne({ email: userInfo.email });
		if (!user) {
			user =  await User.findOne({ phone: userInfo.email }) ;
		}
		if (!user) {
			user =  await User.findOne({ username: userInfo.email }) ;
		}
		if(!user) {
			throw new Error('user is not registered');
		}
		if (user.isVerified) {
			throw new Error('Account already verified');
		} else {
			try {
				
				const random = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
				user.verificationCode = random ;
				const savedUser = await user.save();
				if(user.email) {
					sendMail(
						user.email,
						'Welcome to SmartCity',
						'Welcome ' +
						user.email.split('@')[0] +
							' You have successfully registered to the app your account is now active you can login to the app ' +
							'' +
							' your verification code is ' +
							random 
					);
				}else if (user.phone) {
					var phone_to = user.phone.substring(1) ;
					var data = JSON.stringify({
						"message": ' your verification code is ' +random,
						"to": phone_to ,
						"sender_id": "Proximity"
					  });
					  
					  var config = {
						method: 'post',
						url: 'https://api.sms.to/sms/estimate',
						headers: { 
						  'Authorization': 'Bearer '+process.env.SMSTO_API_KEY, 
						  'Content-Type': 'application/json'
						},
						data : data
					  };
					  
					  axios(config)
					  .then(function (response) {
						console.log(JSON.stringify(response.data));
					  })
					  .catch(function (error) {
						console.log(error);
					  });
					  
				}
				
				return true ;
				
			} catch (err) {
				throw err;
			}
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};
