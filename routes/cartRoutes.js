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

// Buyer-only middleware
const buyerOnly = (req, res, next) => {
  if (req.user.userType !== 'Buyer') {
    return res.status(403).json({ message: 'Access denied. Buyers only.' });
  }
  next();
};

// Cart routes with middleware applied per route
router.get('/cart', authenticate, buyerOnly, getCart);
router.post('/cart/add', authenticate, buyerOnly, addToCart);
router.put('/cart/update/:itemId', authenticate, buyerOnly, updateCartItem);
router.delete('/cart/remove/:itemId', authenticate, buyerOnly, removeFromCart);
router.delete('/cart/clear', authenticate, buyerOnly, clearCart);

module.exports = router;
