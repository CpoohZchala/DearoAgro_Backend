const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  memberId: { type: String, required: true },  
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  cropName: { type: String, required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  pricePerKg: { type: Number, required: true, default: 0 },
  harvestDate: { type: Date, required: true },
  currentPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Stock', stockSchema);


