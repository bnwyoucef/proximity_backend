const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
var User = require('../models/User');
const { sendMail } = require('../middleware/email');

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
						userInfo.email +
						' your password is ' +
						userInfo.password +
						' ' +
						''
				);
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
			if (user.isVerified) {
				const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.ACCESS_TOKEN_SECRET).toString(CryptoJS.enc.Utf8);
				const inputPassword = userInfo.password;
				if (hashedPassword === inputPassword) {
					const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
					return {
						token,
						user: {
							id: user._id,
							email: user.email,
							role: user.role,
						},
					};
				} else {
					throw new Error('password is incorrect');
				}
			} else {
				throw new Error('Account not verified');
			}
		} else {
			throw new Error('user is not registered');
		}
	} catch (err) {
		throw err;
	}
};

//VERIFY
exports.verify = async (userInfo) => {
	try {
		const user = await User.findOne({ email: userInfo.email });
		if (!user) throw new Error('Wrong User Name');
		if (user.verificationCode == userInfo.verificationCode) {
			user.isVerified = true;
			user.save();
			try {
				sendMail(user.email, 'Registration Completed', 'Your email is Now Verified');
			} catch (err) {
				console.log(err);
			}
			return 'hello ' + user.email + ' your email is now verified';
		} else {
			throw Error('User code incorrect');
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};
