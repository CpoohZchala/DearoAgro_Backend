const Cart = require('../models/Cart');
const Stock = require('../models/Stock');

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

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const stock = await Stock.findById(stockId);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    if (quantity > stock.currentAmount) {
      return res.status(400).json({ message: `Only ${stock.currentAmount} kg available` });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      cart = new Cart({ buyer: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.stockId.toString() === stockId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        stockId: stock._id,
        name: stock.cropName,
        image: stock.imageUrl || '',
        quantity,
        price: stock.currentPrice || stock.pricePerKg
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Cart Item
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

// Remove Item
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items.id(itemId)?.remove();
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
