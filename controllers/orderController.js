const mongoose = require('mongoose');

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Stock = require('../models/Stock');


// =========================================================
// CREATE ORDER
// =========================================================
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const buyerId = req.user.id;

    const {
      shippingAddress,
      paymentMethod,
    } = req.body;


    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: 'Buyer authentication required',
      });
    }


    if (
      req.user.userType &&
      req.user.userType !== 'Buyer'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can place orders',
      });
    }


    if (
      !shippingAddress ||
      !shippingAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }


    const allowedPaymentMethods = [
      'Cash on Delivery',
      'Bank Transfer',
    ];


    if (
      !allowedPaymentMethods.includes(
        paymentMethod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }


    session.startTransaction();


    const cart = await Cart.findOne({
      buyer: buyerId,
    }).session(session);


    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
      });
    }


    // =====================================================
    // CHECK + REDUCE STOCK
    // =====================================================
    for (const item of cart.items) {
      const stock =
        await Stock.findOneAndUpdate(
          {
            _id: item.stockId,

            currentAmount: {
              $gte: item.quantity,
            },
          },

          {
            $inc: {
              currentAmount: -item.quantity,
            },
          },

          {
            new: true,
            session,
          },
        );


      if (!stock) {
        const error = new Error(
          `Not enough stock available for ${item.name}`,
        );

        error.statusCode = 400;

        throw error;
      }
    }


    const orderItems =
      cart.items.map((item) => ({
        stockId: item.stockId,
        name: item.name,
        image: item.image || '',
        quantity: item.quantity,
        price: item.price,
      }));


    const createdOrders =
      await Order.create(
        [
          {
            buyerId,

            items: orderItems,

            shippingAddress:
              shippingAddress.trim(),

            paymentMethod,

            status: 'Pending',
          },
        ],
        {
          session,
        },
      );


    const order = createdOrders[0];


    // Clear cart
    cart.items = [];
    cart.total = 0;

    await cart.save({
      session,
    });


    await session.commitTransaction();


    return res.status(201).json({
      success: true,

      message:
        'Order placed successfully',

      order,
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }


    console.error(
      'Create order error:',
      error,
    );


    return res
      .status(
        error.statusCode || 500,
      )
      .json({
        success: false,

        message:
          error.message ||
          'Failed to create order',
      });

  } finally {
    await session.endSession();
  }
};


// =========================================================
// ADMIN - GET ALL ORDERS
// GET /api/orders
// =========================================================
const getAllOrders = async (req, res) => {
  try {

    // Buyer should not access all customer orders
    if (req.user.userType === 'Buyer') {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to view all orders',
      });
    }


    const orders =
      await Order.find({})
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      count:
        orders.length,

      orders,
    });

  } catch (error) {

    console.error(
      'Get all orders error:',
      error,
    );


    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch orders',
    });
  }
};


// =========================================================
// LOGGED-IN BUYER ORDERS
// GET /api/orders/my
// =========================================================
const getMyOrders = async (req, res) => {
  try {

    const buyerId =
      req.user.id;


    const orders =
      await Order.find({
        buyerId,
      })
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      orders,
    });

  } catch (error) {

    console.error(
      'Get my orders error:',
      error,
    );


    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch orders',
    });
  }
};


// =========================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =========================================================
const getOrderById = async (req, res) => {
  try {

    const {
      orderId,
    } = req.params;


    let order;


    // Buyer can only see own order
    if (req.user.userType === 'Buyer') {

      order =
        await Order.findOne({
          _id: orderId,

          buyerId:
            req.user.id,
        });

    } else {

      // Admin can view any order
      order =
        await Order.findById(
          orderId,
        );
    }


    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          'Order not found',
      });
    }


    return res.status(200).json({
      success: true,

      order,
    });

  } catch (error) {

    console.error(
      'Get order details error:',
      error,
    );


    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch order details',
    });
  }
};


// =========================================================
// GET ORDERS BY BUYER
// GET /api/orders/buyer/:buyerId
// =========================================================
const getOrdersByBuyer = async (
  req,
  res,
) => {
  try {

    const buyerId =
      req.params.buyerId;


    const orders =
      await Order.find({
        buyerId,
      })
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      orders,
    });

  } catch (error) {

    console.error(
      'Get orders by buyer error:',
      error,
    );


    return res.status(500).json({
      success: false,

      message:
        'Failed to fetch orders',
    });
  }
};


// =========================================================
// ADMIN - UPDATE ORDER STATUS
// PUT /api/orders/:orderId/status
// =========================================================
const updateOrderStatus = async (
  req,
  res,
) => {
  try {

    if (req.user.userType === 'Buyer') {
      return res.status(403).json({
        success: false,

        message:
          'You are not authorized to update orders',
      });
    }


    const {
      status,
    } = req.body;


    const allowedStatuses = [
      'Pending',
      'Completed',
    ];


    if (
      !allowedStatuses.includes(
        status,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Invalid order status',
      });
    }


    const order =
      await Order.findById(
        req.params.orderId,
      );


    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          'Order not found',
      });
    }


    await order.updateStatus(
      status,
    );


    return res.status(200).json({
      success: true,

      message:
        'Order status updated successfully',

      order,
    });

  } catch (error) {

    console.error(
      'Update order status error:',
      error,
    );


    return res.status(500).json({
      success: false,

      message:
        'Failed to update order status',
    });
  }
};


// =========================================================
// ADMIN - DELETE ORDER
// DELETE /api/orders/:orderId
// =========================================================
const deleteOrder = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {

    if (req.user.userType === 'Buyer') {
      return res.status(403).json({
        success: false,

        message:
          'You are not authorized to delete orders',
      });
    }


    session.startTransaction();


    const order =
      await Order.findById(
        req.params.orderId,
      ).session(session);


    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,

        message:
          'Order not found',
      });
    }


    // =====================================================
    // IF PENDING ORDER IS DELETED,
    // RETURN QUANTITY BACK TO STOCK
    // =====================================================
    if (order.status === 'Pending') {

      for (const item of order.items) {

        await Stock.findByIdAndUpdate(
          item.stockId,

          {
            $inc: {
              currentAmount:
                item.quantity,
            },
          },

          {
            session,
          },
        );
      }
    }


    await Order.deleteOne(
      {
        _id: order._id,
      },
      {
        session,
      },
    );


    await session.commitTransaction();


    return res.status(200).json({
      success: true,

      message:
        'Order deleted successfully',

      deletedOrderId:
        order._id,
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }


    console.error(
      'Delete order error:',
      error,
    );


    return res.status(500).json({
      success: false,

      message:
        'Failed to delete order',
    });

  } finally {

    await session.endSession();
  }
};


// =========================================================
// EXPORT
// =========================================================
module.exports = {
  createOrder,

  getAllOrders,

  getMyOrders,

  getOrderById,

  getOrdersByBuyer,

  updateOrderStatus,

  deleteOrder,
};