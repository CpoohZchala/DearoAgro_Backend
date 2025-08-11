const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: mongoose.Schema.Types.Decimal128, 
    required: true, 
    default: 1.0,
    min: [0.1, 'Quantity cannot be less than 0.1'],
    validate: {
      validator: function(v) {
        return v >= 0.1;
      },
      message: 'Quantity must be at least 0.1'
    }
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

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
    default: 0
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
  this.total = this.items.reduce((sum, item) => {
    // Convert Decimal128 to number for calculation
    const quantity = item.quantity instanceof mongoose.Types.Decimal128 
      ? parseFloat(item.quantity.toString()) 
      : item.quantity;
    return sum + (item.price * quantity);
  }, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);