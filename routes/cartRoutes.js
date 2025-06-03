const express = require('express');
const CartController = require('../controllers/cartController'); // Correct import

const cartController = new CartController(); // Instantiate the class

const router = express.Router();

router.post('/add', cartController.addToCart); // Add to cart route
router.delete('/remove/:id', cartController.removeFromCart); // Remove from cart route
router.get('/', cartController.getCart); // Get cart details route

module.exports = router;