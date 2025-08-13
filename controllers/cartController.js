const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart for a buyer
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user.id })
                          .populate('items.product', 'name price image quantity');
    
    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }
    
    // Verify product availability and update prices
    const updatedItems = await Promise.all(cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) return null;
      
      // Check stock availability
      if (product.quantity < item.quantity) {
        item.quantity = product.quantity; // Adjust to max available
      }
      
      // Update price if changed
      if (product.price !== item.price) {
        item.price = product.price;
      }
      
      return item;
    }));
    
    // Filter out items with deleted products
    cart.items = updatedItems.filter(item => item !== null);
    await cart.save();
    
    res.status(200).json({
      items: cart.items,
      total: cart.total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required (minimum 0.1)' });
    }
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check stock availability
    if (product.quantity < parsedQuantity) {
      return res.status(400).json({ 
        message: `Only ${product.quantity} kg available`,
        availableQuantity: product.quantity
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      cart = new Cart({
        buyer: req.user.id,
        items: []
      });
    }
    
    // Check if product already in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId.toString()
    );
    
    if (existingItem) {
      // Calculate new quantity
      const newQuantity = parseFloat((existingItem.quantity + parsedQuantity).toFixed(2));
      
      // Verify stock for updated quantity
      if (newQuantity > product.quantity) {
        return res.status(400).json({ 
          message: `Cannot add more than available quantity (${product.quantity} kg total)`,
          availableQuantity: product.quantity - existingItem.quantity
        });
      }
      
      existingItem.quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: parseFloat(parsedQuantity.toFixed(2)),
        price: product.price,
        name: product.name,
        image: product.image
      });
    }
    
    await cart.save();
    res.status(200).json({
      message: 'Item added to cart',
      cart: {
        items: cart.items,
        total: cart.total
      }
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
    
    // Validate input
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required (minimum 0.1)' });
    }
    
    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Get product details for stock check
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: 'Product no longer available' });
    }
    
    // Check stock availability
    if (parsedQuantity > product.quantity) {
      return res.status(400).json({ 
        message: `Only ${product.quantity} kg available`,
        availableQuantity: product.quantity
      });
    }
    
    item.quantity = parseFloat(parsedQuantity.toFixed(2));
    await cart.save();
    
    res.status(200).json({
      message: 'Cart item updated',
      cart: {
        items: cart.items,
        total: cart.total
      }
    });
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
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const initialCount = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    if (cart.items.length === initialCount) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    await cart.save();
    
    res.status(200).json({
      message: 'Item removed from cart',
      cart: {
        items: cart.items,
        total: cart.total
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
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
    
    res.status(200).json({
      message: 'Cart cleared',
      cart: cart || { items: [], total: 0 }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};