const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');

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

router.get('/cart', authenticate, cartController.getCart);
router.post('/cart/add', authenticate, cartController.addToCart);
router.put('/cart/update/:itemId', authenticate, cartController.updateCartItem);
router.delete('/cart/remove/:itemId', authenticate, cartController.removeFromCart);
router.delete('/cart/clear', authenticate, cartController.clearCart); // Clear cart

module.exports = router;
