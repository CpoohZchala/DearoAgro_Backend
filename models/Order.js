const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  name: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [ItemSchema],
  totalAmount: { type: Number },
  shippingAddress: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  paymentMethod: { type: String, required: true },
}, { timestamps: true });

// Calculate totalAmount before saving
OrderSchema.pre('save', function (next) {
  this.totalAmount = parseFloat(
    this.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  next();
});

// Method to update order status
OrderSchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  await this.save();
  return this;
};

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
