const Cart = require('../models/Cart');
const Stock = require('../models/Stock'); 

// Get cart for a buyer
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user.id });

    if (!cart) return res.status(200).json({ items: [], total: 0 });

    res.status(200).json({
      items: cart.items,
      total: cart.total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add stock to cart
exports.addToCart = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId) return res.status(400).json({ message: 'Stock ID is required' });

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity required (min 0.1)' });
    }

    // Get stock details
    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isProductListed) {
      return res.status(404).json({ message: 'Stock not found or not listed' });
    }

    if (parsedQuantity > stock.currentAmount) {
      return res.status(400).json({ 
        message: `Only ${stock.currentAmount} kg available`, 
        availableQuantity: stock.currentAmount 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      cart = new Cart({ buyer: req.user.id, items: [] });
    }

    // Check if stock already in cart
    const existingItem = cart.items.find(item => 
      item.stockId.toString() === stockId.toString()
    );

    if (existingItem) {
      const newQuantity = parseFloat((existingItem.quantity + parsedQuantity).toFixed(2));

      if (newQuantity > stock.currentAmount) {
        return res.status(400).json({ 
          message: `Cannot add more than available (${stock.currentAmount} kg total)` 
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        stockId: stock._id,
        quantity: parsedQuantity,
        price: stock.pricePerKg,
        name: stock.cropName,
        image: stock.imageUrl || ''
      });
    }

    await cart.save();

    res.status(200).json({
      message: 'Stock added to cart',
      cart: { items: cart.items, total: cart.total }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity required (min 0.1)' });
    }

    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    const stock = await Stock.findById(item.stockId);
    if (!stock) return res.status(404).json({ message: 'Stock no longer available' });

    if (parsedQuantity > stock.currentAmount) {
      return res.status(400).json({ 
        message: `Only ${stock.currentAmount} kg available`, 
        availableQuantity: stock.currentAmount 
      });
    }

    item.quantity = parsedQuantity;
    await cart.save();

    res.status(200).json({ message: 'Cart item updated', cart: { items: cart.items, total: cart.total } });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({ message: 'Item removed', cart: { items: cart.items, total: cart.total } });

  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { buyer: req.user.id },
      { $set: { items: [], total: 0 } },
      { new: true }
    );

    res.status(200).json({ message: 'Cart cleared', cart: cart || { items: [], total: 0 } });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
