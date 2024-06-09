const Plan = require('../models/Plan');

// get all plans
exports.getPlans = async (req) => {
	try {
		const plans = await Plan.find();
		return plans;
	} catch (error) {
		throw error;
	}
};

// create a new plan
exports.createPlan = async (req) => {
	try {
		const newPlan = new Plan({
			type: req.body.type,
			months: req.body.months,
			price: req.body.price,
		});
		await newPlan.save();
		return newPlan;
	} catch (error) {
		throw error;
	}
};

// update a plan
exports.updatePlan = async (req) => {
	try {
		const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!plan) throw Error('The plan with the given ID was not found.');
		return plan;
	} catch (error) {
		throw error;
	}
};

// delete a plan
exports.deletePlan = async (req) => {
	try {
		await Plan.findByIdAndDelete(req.params.id);
		return { message: 'Plan deleted successfully' };
	} catch (error) {
		throw error;
	}
};
