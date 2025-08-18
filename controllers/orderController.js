const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Place Order from Cart
exports.placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Find buyer's cart
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Create order
    const order = new Order({
      buyer: req.user._id,
      items: cart.items,
      totalAmount: cart.total, // auto calculate from cart
      shippingAddress,
      paymentMethod,
      status: 'pending'
    });

    await order.save();

    // Clear cart after order
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders of the logged-in buyer
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.stockId');
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Make sure user can only see their own orders
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status (for admin / seller use)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status; // "pending" | "complete"
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
