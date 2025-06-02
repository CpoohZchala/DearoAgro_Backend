const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add item to cart
router.post('/add', cartController.addToCart);

// Get cart contents
router.get('/cart/:userId', async (req, res, next) => {
    try {
        console.log('Fetching cart contents for user:', req.user); // Debug log
        await cartController.getCartContents(req, res, next);
    } catch (error) {
        console.error('Error in GET /cart route:', error); // Log the error
        next(error); // Pass the error to the error handler
    }
});

// Remove item from cart
router.delete('/remove/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;