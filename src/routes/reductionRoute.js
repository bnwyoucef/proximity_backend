// ibrahim : i had create htis file 
const express = require('express');
const router = express.Router();
const reductionOfferController = require('../controllers/reductionController');

router.post('/reduction-offers', reductionOfferController.createReductionOffer);
router.put('/reduction-offers/:id', reductionOfferController.updateReductionOffer);
router.delete('/reduction-offers/:id', reductionOfferController.deleteReductionOffer);
router.get('/reduction-offers/:id', reductionOfferController.getReductionOfferById);
router.get('/reduction-offers', reductionOfferController.getAllReductionOffers);

module.exports = router;
