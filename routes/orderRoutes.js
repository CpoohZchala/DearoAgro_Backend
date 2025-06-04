const express = require('express');
const { createOrder, getOrders, getOrderById ,deleteOrder} = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Protect all routes with authentication
router.use(authenticate);

// Create a new order from the cart
router.post('/', createOrder);

// Get all orders for the authenticated buyer
router.get('/', getOrders);

// Get a specific order by ID
router.get('/:id', getOrderById);

//Delete Order
router.delete('/orders/:id', orderController.deleteOrder);

module.exports = router;