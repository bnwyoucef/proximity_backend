// ibrahim : i had cretate this file 
const ReductionOffer = require('../models/ReductionOffer');
const Plan = require('../models/Plan'); // Import the Plan model

// create a new reduction
exports.createReductionOffer = async (data) => {
    try {
        const reductionOffer = new ReductionOffer(data);
        const savedReductionOffer = await reductionOffer.save();

        // Update the corresponding plan
        await Plan.findByIdAndUpdate(
            data.plan, // Assuming `data.plan` contains the ID of the related plan
            { $push: { reductionOffers: savedReductionOffer._id } }
        );

        return savedReductionOffer;
    } catch (error) {
        throw new Error(error.message);
    }
};

// update reduction
exports.updateReductionOffer = async (id, data) => {
    try {
        const oldReductionOffer = await ReductionOffer.findById(id);
        if (!oldReductionOffer) {
            throw new Error('ReductionOffer not found');
        }

        // Update the reduction offer
        const updatedReductionOffer = await ReductionOffer.findByIdAndUpdate(id, data, { new: true });

        // If the plan has changed, update the old and new plans
        if (data.plan && data.plan !== oldReductionOffer.plan.toString()) {
            // Remove from old plan
            await Plan.findByIdAndUpdate(
                oldReductionOffer.plan,
                { $pull: { reductionOffers: oldReductionOffer._id } }
            );

            // Add to new plan
            await Plan.findByIdAndUpdate(
                data.plan,
                { $push: { reductionOffers: updatedReductionOffer._id } }
            );
        }

        return updatedReductionOffer;
    } catch (error) {
        throw new Error(error.message);
    }
};

// delete reduction
exports.deleteReductionOffer = async (id) => {
    try {
        const reductionOffer = await ReductionOffer.findByIdAndDelete(id);
        if (!reductionOffer) {
            throw new Error('ReductionOffer not found');
        }

        // Remove from the associated plan
        await Plan.findByIdAndUpdate(
            reductionOffer.plan,
            { $pull: { reductionOffers: reductionOffer._id } }
        );

        return reductionOffer;
    } catch (error) {
        throw new Error(error.message);
    }
};

// get reduction by id
exports.getReductionOfferById = async (id) => {
    try {
        const reductionOffer = await ReductionOffer.findById(id);
        if (!reductionOffer) {
            throw new Error('ReductionOffer not found');
        }
        return reductionOffer;
    } catch (error) {
        throw new Error(error.message);
    }
};

// get all reduction
exports.getAllReductionOffers = async () => {
    try {
        return await ReductionOffer.find();
    } catch (error) {
        throw new Error(error.message);
    }
};
