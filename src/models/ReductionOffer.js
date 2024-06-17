const mongoose = require('mongoose');

const ReductionOfferSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        discountType: {
            type: String,
            required: true,
            enum: ['percentage', 'amount'],
            default: 'percentage',
        },
        StartDate: {
            type: Date,
            required: true,
        },
        EndDate: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['inactive', 'active', 'expired'],
            default: 'inactive',
        },
    },
    { timestamps: true }
);

// Pre-save hook to ensure only one offer is active at a time
ReductionOfferSchema.pre('save', async function (next) {
    const offer = this;

    // If the current offer is being set to active
    if (offer.status === 'active') {
        // Find the currently active offer
        const activeOffer = await mongoose.model('ReductionOffer').findOne({ status: 'active' });

        // If another active offer is found and it's not the current offer being updated
        if (activeOffer && activeOffer._id.toString() !== offer._id.toString()) {
            // Set the old active offer to inactive
            activeOffer.status = 'inactive';
            await activeOffer.save();
        }
    }

    next();
});

// Pre-update hook to ensure only one offer is active at a time
ReductionOfferSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    // If the status is being set to active
    if (update.status === 'active') {
        // Find the currently active offer
        const activeOffer = await mongoose.model('ReductionOffer').findOne({ status: 'active' });

        // If another active offer is found and it's not the current offer being updated
        if (activeOffer && activeOffer._id.toString() !== this.getQuery()._id.toString()) {
            // Set the old active offer to inactive
            activeOffer.status = 'inactive';
            await activeOffer.save();
        }
    }

    next();
});

module.exports = mongoose.model('ReductionOffer', ReductionOfferSchema);
