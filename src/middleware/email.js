const nodemailer = require('nodemailer');
require('dotenv').config();
const sendMail = (email, subject, message , html = false) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	
	let mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: subject,
		text: message,
	};
	if(html) {
		mailOptions = {
			from: process.env.EMAIL,
			to: email,
			subject: subject,
			html: message,
		} ;
	}
	console.log(mailOptions) ; 
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
};
module.exports = { sendMail };
