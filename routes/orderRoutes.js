const express = require('express');

const router = express.Router();

const authenticate =
  require('../middleware/authenticate');


const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrdersByBuyer,
  updateOrderStatus,
  deleteOrder,
} = require(
  '../controllers/orderController',
);


// =========================================================
// BUYER - CREATE ORDER
// POST /api/orders
// =========================================================
router.post(
  '/',
  authenticate,
  createOrder,
);


// =========================================================
// ADMIN - GET ALL ORDERS
// GET /api/orders
// =========================================================
router.get(
  '/',
  authenticate,
  getAllOrders,
);


// =========================================================
// BUYER - GET MY ORDERS
// GET /api/orders/my
// =========================================================
router.get(
  '/my',
  authenticate,
  getMyOrders,
);


// =========================================================
// GET ORDERS BY BUYER
// GET /api/orders/buyer/:buyerId
// =========================================================
router.get(
  '/buyer/:buyerId',
  authenticate,
  getOrdersByBuyer,
);


// =========================================================
// ADMIN - UPDATE STATUS
// PUT /api/orders/:orderId/status
// =========================================================
router.put(
  '/:orderId/status',
  authenticate,
  updateOrderStatus,
);


// =========================================================
// ADMIN - DELETE ORDER
// DELETE /api/orders/:orderId
// =========================================================
router.delete(
  '/:orderId',
  authenticate,
  deleteOrder,
);


// =========================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
//
// KEEP THIS LAST
// =========================================================
router.get(
  '/:orderId',
  authenticate,
  getOrderById,
);


module.exports =
  router;