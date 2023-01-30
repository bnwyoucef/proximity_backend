const User = require('../models/User');
const ResetPassword = require('../models/ResetPassword');

const { sendMail } = require('../middleware/email');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');



//create token for reset password 
exports.requestResetPassword = async (req) => {
	try {
		let user = await User.findOne({ email: req.email });
		if(!user) {
			user = await User.findOne({ phone: req.email });
		}
		if(!user) {
			user = await User.findOne({ username: req.email });
		}

		if (user) {
            let tokenResetPassword = await ResetPassword.findOne({userId : user._id}) ; 
            if(!tokenResetPassword) {
                tokenResetPassword = await new ResetPassword({
                    userId : user._id , 
                    token : crypto.randomBytes(32).toString('hex')
                }).save() ;
            }
            
            const link = process.env.APP_URL+'/api/password-reset/'+user._id+'/'+tokenResetPassword.token ; 

            
				if(user.email) {
					sendMail(
						user.email,
						'SmartCity [Reset Password]',
						'Hello ' +
							' You are receiving this email because we received a password reset request for your account.' +
							link +
							' This password reset link will expire in 60 minutes. ' +
							' If you did not request a password reset, no further action is required.' +
							' Best Regards, ' 
					);
				}else if (user.phone) {
					var phone_to = "+213"+user.phone.substring(1) ;
					var data = JSON.stringify({
						"message": ' your link for reset password is : ' +link,
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

                
			return {
				success : true , 
				message : "", 
				data : link
			};

            
            
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


//check token 
exports.checkToken = async (req) => {
	try {
        let tokenResetPassword = await ResetPassword.findOne({token : req.params.token}) ; 
        
        console.log(req.params) ;

		if (tokenResetPassword && tokenResetPassword.userId == req.params.id) {
            
			return {
				success : true , 
				message : "", 
				data : null
			};

            
            
		} else {
			return {
				success : false , 
				message : "the token does not exist" , 
				data : null
			};
		}
	} catch (err) {
		throw err;
	}
};


//resetPassword
exports.resetPassword = async (req) => {
	try {
        let tokenResetPassword = await ResetPassword.findOne({token : req.params.token}) ; 
        

		if (tokenResetPassword && tokenResetPassword.userId == req.params.id ) {
            let user = await User.findOne({token : req.params.id}) ; 
            

            if(!(req.body.password && req.body.password_confirmation && req.body.password == req.body.password_confirmation)) {
                throw new Error('The password and its confirmation are not the same');
            }
            
            if (req.body.password) {
                req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.ACCESS_TOKEN_SECRET).toString();
            }
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                {
                    password: req.body.password ,
                },
                { new: true }
            ).select('-password');

            tokenResetPassword.delete()
            
            
			return {
				success : true , 
				message : "", 
				data : null
			};

            
            
		} else {
			return {
				success : false , 
				message : "the token does not exist" , 
				data : null
			};
		}
	} catch (err) {
		throw err;
	}
};
