const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${NODE_ENV}` });
const router = require('express').Router();

const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');
const helmet = require('helmet');

app.use(cors());

//routes

const userRoute = require('./routes/userRoute');
const saleRoute = require('./routes/saleRoute');

const authRoute = require('./routes/authRoute');
const storeRoute = require('./routes/storeRoute');
const productRoute = require('./routes/productRoute');
const cartRoute = require('./routes/cartRoute');
const offerRoute = require('./routes/offerRoute');
const categoryRoute = require('./routes/categoryRoute');
const orderRoute = require('./routes/orderRoute');
const searchRoute = require('./routes/searchRoute');
const viewRoute = require('./routes/viewRoute');
const resetPasswordRoute = require('./routes/resetPasswordRoute');
const notificationRoute = require('./routes/notificationRoute');
const storeCategoryRoute = require('./routes/storeCategoryRoute');
const planRoute = require('./routes/planRoute');
const subscriptionOfferRoute = require('./routes/SubscriptionOfferRoute');
const subscriptionRoute = require('./routes/subscriptionRoute');
const elasticSearchRoute = require('./routes/elasticSearchRoute');
const reductionRoute = require('./routes/reductionRoute');

const paymentTypeRoute = require('./routes/paymentTypeRoute');
//const adminRoute = require('./routes/admin');*/
app.use(helmet());
app.use(fileUpload());
app.use(express.json());

/////////
router.get('/', async (req, res) => {
	console.log('request recieved');
	res.send('backend connected');
});

app.use(express.static('public'));
app.use('/api', router);
app.use('/api/user', userRoute);
app.use('/api/sale', saleRoute);

app.use('/api/auth', authRoute);
app.use('/api/store', storeRoute);
// ibrahim
app.use('/api/seller', storeRoute);
app.use('/api/reduction', reductionRoute);

app.use('/api/product', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/offer', offerRoute);
app.use('/api/category', categoryRoute);
app.use('/api/order', orderRoute);
app.use('/api/search', searchRoute);
app.use('/api/password-reset', resetPasswordRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/view', viewRoute);
app.use('/api/storeCategory', storeCategoryRoute);
app.use('/api/plan', planRoute);
app.use('/api/subscriptionOffer', subscriptionOfferRoute);
app.use('/api/subscription', subscriptionRoute);
app.use('/api/elasticSearch', elasticSearchRoute);
app.use('/api/paymentType', paymentTypeRoute);

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		console.log('DB Conntected');
		app.listen(process.env.PORT || 8000, () => {
			console.log('backend Running');
		});
	})
	.catch((err) => {
		console.log(err);
	});
