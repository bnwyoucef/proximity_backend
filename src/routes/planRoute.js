const router = require('express').Router();
var PlanController = require('../controllers/planController');

router.get('/', PlanController.getPlans);
router.post('/', PlanController.createPlan);
router.patch('/:id', PlanController.updatePlan);
router.delete('/:id', PlanController.deletePlan);
module.exports = router;
