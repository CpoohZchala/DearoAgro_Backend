const express = require('express');
const { placeOrder, calculateTotal } = require('../controllers/checkoutController');

const router = express.Router();

// Place an order
router.post('/order', placeOrder);

// Calculate total price
router.post('/total', calculateTotal);

module.exports = router;