const Cart = require('../models/Cart');

// Get Cart by Buyer
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.stockId');
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Item to Cart
exports.addToCart = async (req, res) => {
  try {
    const { stockId, name, image, quantity, price } = req.body;

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      cart = new Cart({ buyer: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.stockId.toString() === stockId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ stockId, name, image, quantity, price });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Item Quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await cart.updateItemQuantity(itemId, quantity);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove Item from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items.id(itemId).remove();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
