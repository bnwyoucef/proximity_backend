const mongoose = require('mongoose');

const Sale = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  date: { type: Date, required: true },
  region: { type: String }, // If you want to track region for each sale
});



module.exports = mongoose.model('Sale', Sale);
