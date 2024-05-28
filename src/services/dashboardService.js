// POUR LE DASHBOARD
// A VOIR 

const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
var User = require('../models/User');
const { sendMail } = require('../middleware/email');

var axios = require('axios');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Offer = require('../models/Offer');


exports.inscription = async (userInfo) => {
	try {
		const random = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
		if(userInfo.email && userInfo.email != "" ) {
			const userEmail = await User.findOne({ email: userInfo.email });
			if (userEmail) {
				throw new Error('Email already exists !');
			}
			
		}

		if(!(userInfo.password && userInfo.password_confirmation && userInfo.password == userInfo.password_confirmation)) {
			throw new Error('The password and its confirmation are not the same');
		}
    }
    catch(err){
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
		console.log(req);
		const user = await User.findOne({ email: req.email });
		console.log(user) ;
		if (!user) throw new Error('Wrong User Name');
		if (user.verificationCode === req.verificationCode) {
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

