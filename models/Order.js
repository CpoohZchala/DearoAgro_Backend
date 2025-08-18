const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
  items: [
    {
      stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
      name: { type: String, required: true },
      image: { type: String },
      quantity: { type: Number, required: true, min: [0.1, 'Minimum quantity is 0.1 kg'] },
      price: { type: Number, required: true, min: [0, 'Price must be positive'] }
    }
  ],
  totalAmount: { type: Number, required: true }, // ✅ changed from total
  shippingAddress: { type: String, required: true }, // ✅ new field
  paymentMethod: { type: String, required: true }, // ✅ new field
  status: { type: String, enum: ['pending', 'complete'], default: 'pending' }, // ✅ updated enum
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
