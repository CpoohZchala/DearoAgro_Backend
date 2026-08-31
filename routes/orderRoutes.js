const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');

const {
  createOrder,
  getOrdersByBuyer,
  updateOrderStatus,
} = require('../controllers/orderController');


// Create order
router.post(
  '/',
  authenticate,
  createOrder
);


// Get buyer orders
router.get(
  '/buyer/:buyerId',
  authenticate,
  getOrdersByBuyer
);


// Update order status
router.put(
  '/:orderId/status',
  authenticate,
  updateOrderStatus
);


module.exports = router;