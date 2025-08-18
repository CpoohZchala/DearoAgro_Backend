const express = require('express');
const { placeOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate); // user must be logged in

// Place new order
router.post('/place', placeOrder);

// Get all orders for logged-in buyer
router.get('/', getOrders);

// Get a single order by ID
router.get('/:id', getOrderById);

// Update order status (admin/seller)
router.put('/status', updateOrderStatus);

module.exports = router;
