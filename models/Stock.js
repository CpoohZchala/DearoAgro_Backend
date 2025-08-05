const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  memberId: { type: String, required: true },  
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  cropName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  harvestDate: { type: Date, required: true },
}, {
  timestamps: true 
});

module.exports = mongoose.model('Stock', stockSchema);
