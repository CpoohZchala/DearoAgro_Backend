const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  stockId: { // Store stock id instead of product
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock', // reference to Stock collection
    required: true
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1,
    min: [0.1, 'Minimum quantity is 0.1 kg'],
    set: v => parseFloat(v.toFixed(2)) // Store with 2 decimal places
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive'],
    set: v => parseFloat(v.toFixed(2))
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
}, { _id: true });

const CartSchema = new mongoose.Schema({
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Buyer', 
    required: true,
    unique: true 
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0,
    set: v => parseFloat(v.toFixed(2))
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total before saving
CartSchema.pre('save', function(next) {
  this.total = parseFloat(this.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  ).toFixed(2));
  this.updatedAt = Date.now();
  next();
});

// Instance method to update quantity
CartSchema.methods.updateItemQuantity = async function(itemId, newQuantity) {
  const item = this.items.id(itemId);
  if (!item) throw new Error('Item not found in cart');
  
  item.quantity = parseFloat(newQuantity.toFixed(2));
  await this.save();
  return this;
};

module.exports = mongoose.model('Cart', CartSchema);
