const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');

router.get('/cart', authenticate, cartController.getCart);
router.post('/cart/add', authenticate, cartController.addToCart);
router.put('/cart/update/:itemId', authenticate, cartController.updateCartItem);
router.delete('/cart/remove/:itemId', authenticate, cartController.removeFromCart);
router.delete('/cart/clear', authenticate, cartController.clearCart);

module.exports = router;
