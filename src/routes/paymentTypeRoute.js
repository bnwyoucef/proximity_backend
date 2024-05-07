const router = require('express').Router();
var PaymentTypeController = require('../controllers/paymentTypeController');

router.get('/', PaymentTypeController.getPaymentTypes);
router.post('/', PaymentTypeController.createPaymentType);
router.patch('/:id', PaymentTypeController.updatePaymentType);
router.delete('/:id', PaymentTypeController.deletePaymentType);
module.exports = router;
