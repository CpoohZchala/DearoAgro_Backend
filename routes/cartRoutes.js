const express = require('express');
const router = express.Router();
const { addToCart } = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware');

// Add item to cart
router.post('/add', authenticate, addToCart);

// Get cart contents
router.get('/', cartController.getCartContents);

// Remove item from cart
router.delete('/remove/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;