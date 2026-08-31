const mongoose = require('mongoose');

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Stock = require('../models/stockModel');


// =========================================================
// CREATE ORDER
// =========================================================
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // Comes from your JWT
    const buyerId = req.user.id;

    const {
      shippingAddress,
      paymentMethod,
    } = req.body;


    // Buyer ID check
    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: 'Buyer authentication required',
      });
    }


    // Only Buyer accounts can checkout
    if (
      req.user.userType &&
      req.user.userType !== 'Buyer'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can place orders',
      });
    }


    // Address validation
    if (
      !shippingAddress ||
      !shippingAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }


    // Payment validation
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


    // Start transaction
    session.startTransaction();


    // Get logged-in buyer cart
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


    // Check and reduce stock
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
            currentAmount:
                -item.quantity,
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


    // Copy cart items to order
    const orderItems =
        cart.items.map((item) => ({
      stockId: item.stockId,
      name: item.name,
      image: item.image || '',
      quantity: item.quantity,
      price: item.price,
    }));


    // Create order
    const createdOrders =
        await Order.create(
      [
        {
          buyerId: buyerId,

          items: orderItems,

          shippingAddress:
              shippingAddress.trim(),

          paymentMethod:
              paymentMethod,

          status: 'Pending',
        },
      ],
      {
        session,
      },
    );


    const order =
        createdOrders[0];


    // Clear cart
    cart.items = [];
    cart.total = 0;

    await cart.save({
      session,
    });


    // Commit
    await session.commitTransaction();


    return res.status(201).json({
      success: true,
      message:
          'Order placed successfully',
      order: order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      'Create order error:',
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
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
// GET BUYER ORDERS
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
      buyerId: buyerId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error(
      'Get orders error:',
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
// UPDATE ORDER STATUS
// =========================================================
const updateOrderStatus = async (
  req,
  res,
) => {
  try {
    const { status } = req.body;

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
        message: 'Order not found',
      });
    }


    await order.updateStatus(
      status,
    );


    return res.status(200).json({
      success: true,
      message:
          'Order status updated successfully',
      order: order,
    });
  } catch (error) {
    console.error(
      'Update order error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
          'Failed to update order status',
    });
  }
};


module.exports = {
  createOrder,
  getOrdersByBuyer,
  updateOrderStatus,
};