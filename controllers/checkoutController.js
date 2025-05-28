const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Place an order
exports.placeOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create a new order
    const order = new Order({
      userId,
      items: cart.items,
      shippingAddress,
      totalPrice: cart.totalPrice,
    });

    await order.save();

    // Clear the cart after placing the order
    await Cart.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Calculate total price
exports.calculateTotalPrice = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ totalPrice: cart.totalPrice });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};