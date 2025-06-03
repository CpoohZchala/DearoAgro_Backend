const express = require('express');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const auth = require('../middleware/auth');

const router = express.Router();

// Protect all routes with buyer authentication
router.use(auth);
router.use((req, res, next) => {
  if (req.user.userType !== 'Buyer') {
    return res.status(403).json({ message: 'Access denied. Buyers only.' });
  }
  next();
});

router.get('/', getCart);                      // Get cart
router.post('/add', addToCart);                // Add item to cart
router.put('/:itemId', updateCartItem);        // Update cart item
router.delete('/:itemId', removeFromCart);     // Remove item from cart
router.delete('/', clearCart);                 // Clear cart

module.exports = router;