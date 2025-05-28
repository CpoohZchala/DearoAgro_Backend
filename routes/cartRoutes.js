const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Add item to cart
router.post('/add', cartController.addToCart);

// Get cart contents
router.get('/', cartController.getCartContents);

// Remove item from cart
router.delete('/remove/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;