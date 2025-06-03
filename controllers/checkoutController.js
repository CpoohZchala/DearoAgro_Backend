const express = require('express');
const { processCheckout } = require('./checkoutController');

const router = express.Router();

router.post('/', processCheckout); // Handle checkout process

module.exports = router;