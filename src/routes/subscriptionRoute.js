const router = require('express').Router();
var SubscriptionController = require('../controllers/subscriptionController');

router.get('/', SubscriptionController.getSubscriptions);
router.get('/details', SubscriptionController.getSubscriptionsDetail);
router.get('/transactions/:paymentManagerId', SubscriptionController.getTransactions);
router.get('/:id', SubscriptionController.getSubscriptionById);
router.post('/', SubscriptionController.createSubscription);
router.patch('/:id', SubscriptionController.updateSubscription);
router.post('/addNote/:id', SubscriptionController.addNote);
//  ibrahim : Add the new route for fetching store information by subscription ID
router.get('/store/:subscriptionId', SubscriptionController.getStoreBySubscriptionId);
// router.get('/subscriptionsbycityorstatus', SubscriptionController.getSubscriptionByCityAndStatus);
// router.get('/subscriptionsbycityandstatus', SubscriptionController.getSubscriptionByCityAndStatus);
// ibrahim : route to get subscrption by status 
router.get('/subscriptions/:status', SubscriptionController.getSubscriptionsByStatus);
// ibrahim : change the statuys of a subscrption 
router.put('/status/:subscriptionId', SubscriptionController.updateSubscriptionStatus);
// ibrahim : get the total number of sybscription
router.get('/subscriptions/total', SubscriptionController.getTotalSubscriptions);
// ibrahim : delete subscrtion 
router.delete('/subscriptions/:subscriptionId', SubscriptionController.deleteSubscription);


module.exports = router;





module.exports = router;
