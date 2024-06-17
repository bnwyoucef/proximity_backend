// ibrahim : i had create this fiel 
const reductionService = require('../services/reductionService');
exports.createReductionOffer = async (req, res) => {

    try {
        const reductionOffer = await reductionService.createReductionOffer(req.body);
        res.status(201).json(reductionOffer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateReductionOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const reductionOffer = await reductionService.updateReductionOffer(id, req.body);
        res.status(200).json(reductionOffer);
    } catch (error) {
        if (error.message === 'ReductionOffer not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

exports.deleteReductionOffer = async (req, res) => {
    try {
        const { id } = req.params;
        await reductionService.deleteReductionOffer(id);
        res.status(200).json({ message: 'ReductionOffer deleted successfully' });
    } catch (error) {
        if (error.message === 'ReductionOffer not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

 exports.getReductionOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const reductionOffer = await reductionService.getReductionOfferById(id);
        res.status(200).json(reductionOffer);
    } catch (error) {
        if (error.message === 'ReductionOffer not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

exports.getAllReductionOffers = async (req, res) => {
    try {
        const reductionOffers = await reductionService.getAllReductionOffers();
        res.status(200).json(reductionOffers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

