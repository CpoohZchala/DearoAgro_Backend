const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrdersByBuyer,
  updateOrderStatus
} = require('../controllers/orderController');

// Create a new order
router.post('/', createOrder);

// Get orders by buyer
router.get('/buyer/:buyerId', getOrdersByBuyer);

// Update order status
router.put('/:orderId/status', updateOrderStatus);

module.exports = router;
