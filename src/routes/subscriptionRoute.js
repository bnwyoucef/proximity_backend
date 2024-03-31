const router = require('express').Router();
var SubscriptionController = require('../controllers/subscriptionController');

router.get('/', SubscriptionController.getSubscriptions);
router.get('/:id', SubscriptionController.getSubscriptionById);
router.post('/', SubscriptionController.createSubscription);
router.patch('/:id', SubscriptionController.updateSubscription);
module.exports = router;
