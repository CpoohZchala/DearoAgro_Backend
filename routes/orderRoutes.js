const express =
    require('express');

const router =
    express.Router();


const authenticate =
    require(
  '../middleware/authenticate',
);


const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrdersByBuyer,
  updateOrderStatus,
} = require(
  '../controllers/orderController',
);


// =========================================================
// CREATE ORDER
//
// POST /api/orders
// =========================================================
router.post(
  '/',
  authenticate,
  createOrder,
);


// =========================================================
// LOGGED-IN BUYER ORDERS
//
// GET /api/orders/my
// =========================================================
router.get(
  '/my',
  authenticate,
  getMyOrders,
);


// =========================================================
// GET ORDERS BY BUYER
//
// GET /api/orders/buyer/:buyerId
// =========================================================
router.get(
  '/buyer/:buyerId',
  authenticate,
  getOrdersByBuyer,
);


// =========================================================
// UPDATE ORDER STATUS
//
// PUT /api/orders/:orderId/status
// =========================================================
router.put(
  '/:orderId/status',
  authenticate,
  updateOrderStatus,
);


// =========================================================
// GET SINGLE ORDER
//
// GET /api/orders/:orderId
// =========================================================
//
// IMPORTANT:
// Keep this after /my and /buyer routes.
//
router.get(
  '/:orderId',
  authenticate,
  getOrderById,
);


module.exports =
    router;