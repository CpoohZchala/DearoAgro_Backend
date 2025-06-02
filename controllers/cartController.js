const Cart = require('../models/Cart');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');



// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const userId = req.user?.id; // Ensure req.user exists
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({ productId, quantity: 1 });
        }

        // Save cart
        await cart.save();
        res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
};

// Get cart contents
exports.getCartContents = async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from the route parameter
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart contents:', error);
        res.status(500).json({ message: 'Error fetching cart contents' });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== itemId);
        await cart.save();

        res.status(200).json({ message: `Item with ID ${itemId} removed from cart` });
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart' });
    }
};

// Add this to your cartController.js
exports.cleanCart = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) return;
    
    // Get all product IDs referenced in cart
    const productIds = cart.items.map(item => item.productId);
    
    // Check which products still exist
    const existingProducts = await Product.find({ 
        _id: { $in: productIds } 
    }).select('_id');
    
    const existingProductIds = existingProducts.map(p => p._id.toString());
    
    // Filter out items with missing products
    cart.items = cart.items.filter(item => 
        existingProductIds.includes(item.productId.toString())
    );
    
    await cart.save();
};