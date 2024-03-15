const router = require('express').Router();
var SubscriptionOfferController = require('../controllers/subscriptionOfferController');

router.get('/', SubscriptionOfferController.getOffers);
router.post('/', SubscriptionOfferController.createOffer);
router.patch('/:id', SubscriptionOfferController.updateOffer);
router.delete('/:id', SubscriptionOfferController.deleteOffer);
module.exports = router;
