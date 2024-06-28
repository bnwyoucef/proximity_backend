// ibrahim : i had create htis file 
const express = require('express');
const router = express.Router();
const reductionOfferController = require('../controllers/reductionController');

router.post('/', reductionOfferController.createReductionOffer);
router.put('/:id', reductionOfferController.updateReductionOffer);
router.delete('/:id', reductionOfferController.deleteReductionOffer);
router.get('/:id', reductionOfferController.getReductionOfferById);
router.get('/', reductionOfferController.getAllReductionOffers);
router.delete('/:planId/reductions', reductionOfferController.removeAllReductionsForPlan);


module.exports = router;
