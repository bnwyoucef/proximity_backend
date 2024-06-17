// ibrahim : i had create this file 
const ReductionOffer = require('../models/ReductionOffer');

//  create a new reduction  
exports.createReductionOffer = async (data) => {
    try {
        const reductionOffer = new ReductionOffer(data);
        return await reductionOffer.save();
    } catch (error) {
        throw new Error(error.message);
    }
};
// update reduction 
exports.updateReductionOffer = async (id,data) => {

    try {
        const reductionOffer = await ReductionOffer.findByIdAndUpdate(id, data, { new: true });
        if (!reductionOffer) {
            throw new Error('ReductionOffer not found');
        }
        return reductionOffer;
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


