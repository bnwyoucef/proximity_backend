// ibrahim : i had create htis file 
const express = require('express');
const router = express.Router();
const reductionOfferController = require('../controllers/reductionController');

router.post('/', reductionOfferController.createReductionOffer);
router.put('/:id', reductionOfferController.updateReductionOffer);
router.delete('/delete/:id', reductionOfferController.deleteReductionOffer);
router.get('/:id', reductionOfferController.getReductionOfferById);
router.get('/', reductionOfferController.getAllReductionOffers);

module.exports = router;
