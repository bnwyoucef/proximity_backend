const PlanService = require('../services/planService');

// get all plans
exports.getPlans = async (req, res) => {
	try {
		const plans = await PlanService.getPlans(req.params.planId);
		res.send(plans);
	} catch (error) {
		res.status(500).send(err.message);
	}
};
// create a new plan
exports.createPlan = async (req, res) => {
	try {
		const newPlan = await PlanService.createPlan(req);
		res.send(newPlan);
	} catch (error) {
		res.status(500).send(err.message);
	}
};

// update a plan
exports.updatePlan = async (req, res) => {
	try {
		const updatedPlan = await PlanService.updatePlan(req);
		res.send(updatedPlan);
	} catch (error) {
		res.status(500).send(err.message);
	}
};

// delete a plan
exports.deletePlan = async (req, res) => {
	try {
		const message = await PlanService.deletePlan(req);
		res.send(message);
	} catch (error) {
		res.status(500).send(err.message);
	}
};
