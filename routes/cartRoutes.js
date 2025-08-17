const express = require('express');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const auth = require('../middleware/authenticate');

const router = express.Router();

// Protect all routes with buyer authentication
router.use(auth);
router.use((req, res, next) => {
  if (req.user.userType !== 'Buyer') {
    return res.status(403).json({ message: 'Access denied. Buyers only.' });
  }
  next();
});

router.get('/', getCart);                        // Get cart
router.post('/add', addToCart);                  // Add stock to cart
router.put('/update/:itemId', updateCartItem);  // Update cart item quantity
router.delete('/remove/:itemId', removeFromCart); // Remove item
router.delete('/', clearCart);                   // Clear cart

module.exports = router;
