const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      harvestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'complete'], default: 'pending' }, 
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);