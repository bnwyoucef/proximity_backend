const router = require('express').Router();
var SubscriptionController = require('../controllers/subscriptionController');

router.get('/', SubscriptionController.getSubscriptions);
router.get('/transactions/:paymentManagerId', SubscriptionController.getTransactions);
router.get('/:id', SubscriptionController.getSubscriptionById);
router.post('/', SubscriptionController.createSubscription);
router.post('/multiStore', SubscriptionController.createMultiStoreSubscription);
router.patch('/:id', SubscriptionController.updateSubscription);
router.post('/addNote/:id', SubscriptionController.addNote);
module.exports = router;
