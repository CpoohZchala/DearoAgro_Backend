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
    console.log("User from token:", req.user); // Debug the entire user object
    
    // Use req.user.id instead of req.user._id
    const buyerId = req.user.id;
    if (!buyerId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const stock = await Stock.findById(stockId);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    if (quantity > stock.currentAmount) {
      return res.status(400).json({ message: `Only ${stock.currentAmount} kg available` });
    }

    let cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) {
      console.log("Creating new cart for buyer:", buyerId);
      cart = new Cart({ 
        buyer: buyerId,  // Use buyerId here
        items: [] 
      });
    }

    // Rest of your code remains the same...
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
    console.error("Error in addToCart:", err);
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
    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

   // Filter out the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear Cart - Updated Version
exports.clearCart = async (req, res) => {
  try {
    // Try to find existing cart first
    let cart = await Cart.findOne({ buyer: req.user._id });
    
    if (!cart) {
      // If no cart exists, return success (empty cart is same as no cart)
      return res.status(200).json({ 
        message: "Cart already empty",
        cart: { items: [], total: 0 }
      });
    }
    
    // Clear existing cart items
    cart.items = [];
    await cart.save();
    
    res.status(200).json({ 
      message: "Cart cleared successfully",
      cart
    });
    
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ 
      error: "Failed to clear cart",
      details: err.message 
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user); // Debug log
    
    // Use req.user.id instead of req.user._id
    const cart = await Cart.findOne({ buyer: req.user.id }).populate('items.stockId');
    
    if (!cart) {
      console.log("No cart found for user:", req.user.id);
      return res.status(404).json({ message: "Cart not found" });
    }
    
    console.log("Found cart:", cart); // Debug log
    res.json(cart);
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ error: err.message });
  }
};

