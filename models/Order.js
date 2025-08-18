// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//       harvestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
//       quantity: { type: Number, required: true },
//       price: { type: Number, required: true },
//       name: { type: String, required: true }
//     }
//   ],
//   totalAmount: { type: Number, required: true },
//   shippingAddress: { type: String, required: true },
//   status: { type: String, enum: ['pending', 'complete'], default: 'pending' }, 
//   paymentMethod: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: [0.1, 'Minimum quantity is 0.1 kg'] },
  price: { type: Number, required: true, min: [0, 'Price must be positive'] }
}, { _id: true });

const OrderSchema = new mongoose.Schema({
  buyer: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate total before saving
OrderSchema.pre('save', function(next) {
  this.total = parseFloat(this.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  ).toFixed(2));
  this.updatedAt = Date.now();
  next();
});

// Update order status
OrderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  await this.save();
  return this;
};

module.exports = mongoose.model('Order', OrderSchema);