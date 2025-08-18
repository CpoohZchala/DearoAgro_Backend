const express = require('express');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Protect all routes with buyer authentication
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.userType !== 'Buyer') {
    return res.status(403).json({ message: 'Access denied. Buyers only.' });
  }
  next();
});

// Cart routes
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.put('/cart/update/:itemId', updateCartItem);
router.delete('/cart/remove/:itemId', removeFromCart);
router.delete('/cart/clear', clearCart);

module.exports = router;
