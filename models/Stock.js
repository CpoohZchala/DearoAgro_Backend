const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  memberId: { type: String, required: true },  
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  cropName: { type: String, required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  currentAmount: { type: Number, default: 0 }, // New field for current available amount
  pricePerKg: { type: Number, required: true, default: 0 },
  harvestDate: { type: Date, required: true },
  currentPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  isProductListed: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true 
});

// Method to update current amount after order
stockSchema.methods.updateCurrentAmount = function(orderAmount) {
  this.currentAmount = this.totalAmount - orderAmount;
  return this.save();
};

// Pre-save middleware to set initial currentAmount
stockSchema.pre('save', function(next) {
  if (this.isNew && this.currentAmount === 0) {
    this.currentAmount = this.totalAmount;
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema);


