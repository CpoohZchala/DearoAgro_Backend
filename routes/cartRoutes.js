const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware');

// Add item to cart
router.post('/add', authenticate, cartController.addToCart);

// Get cart contents
router.get('/', authenticate, cartController.getCartContents);

// Remove item from cart
router.delete('/remove/:itemId', authenticate, cartController.removeFromCart);

// Clear cart
router.delete('/clear', authenticate, cartController.clearCart);

module.exports = router;