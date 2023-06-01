const router = require('express').Router();
var NotificationController = require('../controllers/notificationController');


const { verifyToken, verifySeller } = require('../middleware/verifyToken');

//creat notification
router.post('/send',  NotificationController.sendNotification);

module.exports = router;
