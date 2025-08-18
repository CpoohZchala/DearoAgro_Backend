const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  memberId: { type: String, required: true },  
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  cropName: { type: String, required: true },
  totalAmount: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  currentAmount: { 
    type: Number, 
    default: 0,
    min: [0, 'Current amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalAmount;
      },
      message: 'Current amount cannot exceed total amount'
    }
  },
  pricePerKg: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Price per kg cannot be negative']
  },
  harvestDate: { type: Date, required: true },
  currentPrice: { 
    type: Number, 
    default: 0,
    min: [0, 'Current price cannot be negative']
  },
  quantity: { 
    type: Number, 
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  isProductListed: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true 
});

// Safe method to update current amount with validation
stockSchema.methods.updateCurrentAmount = async function(orderAmount) {
  if (orderAmount < 0) {
    throw new Error('Order amount cannot be negative');
  }
  
  const newAmount = this.currentAmount - orderAmount;
  
  if (newAmount < 0) {
    throw new Error(`Insufficient stock. Available: ${this.currentAmount}, Requested: ${orderAmount}`);
  }
  
  this.currentAmount = newAmount;
  return this.save();
};

// Pre-save middleware to set initial currentAmount and validate
stockSchema.pre('save', function(next) {
  if (this.isNew) {
    this.currentAmount = this.totalAmount;
  }
  
  // Ensure currentAmount never exceeds totalAmount
  if (this.currentAmount > this.totalAmount) {
    this.currentAmount = this.totalAmount;
  }
  
  next();
});

module.exports = mongoose.model('Stock', stockSchema);