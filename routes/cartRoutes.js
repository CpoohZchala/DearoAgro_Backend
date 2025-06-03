const express = require('express');
const { CartController } = require('../controllers/cartController');

const router = express.Router();
const cartController = new CartController();

router.post('/add', cartController.addToCart);      // Add product to cart
router.delete('/remove/:id', cartController.removeFromCart); // Remove product from cart

module.exports = router;