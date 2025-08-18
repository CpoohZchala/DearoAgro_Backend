// const express = require('express');
// const { createOrder, getOrders, getOrderById ,deleteOrder,updateOrderStatus} = require('../controllers/orderController');
// const authenticate = require('../middleware/authenticate');

// const router = express.Router();

// // Protect all routes with authentication
// router.use(authenticate);

// // Create a new order from the cart
// router.post('/', createOrder);

// // Get all orders for the authenticated buyer
// router.get('/', getOrders);

// // Get a specific order by ID
// router.get('/:id', getOrderById);

// //Delete Order
// router.delete('/:id',deleteOrder);

// // PUT /api/orders/status/:orderId
// router.put('/status/:orderId', updateOrderStatus);
// module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create a new order
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get a specific order by ID
router.get('/:id', orderController.getOrderById);

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;