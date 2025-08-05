const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  cropName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  harvestDate: { type: Date, required: true },
}, {
  timestamps: true // automatically creates createdAt & updatedAt
});

module.exports = mongoose.model('Stock', stockSchema);
