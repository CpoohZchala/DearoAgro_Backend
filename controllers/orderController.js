const mongoose =
    require('mongoose');

const Order =
    require('../models/Order');

const Cart =
    require('../models/Cart');

const Stock =
    require('../models/Stock');


// =========================================================
// CREATE ORDER
// =========================================================
const createOrder = async (
  req,
  res,
) => {
  const session =
      await mongoose.startSession();

  try {
    // Buyer ID comes from JWT
    const buyerId =
        req.user.id;


    const {
      shippingAddress,
      paymentMethod,
    } = req.body;


    // =========================================
    // BUYER CHECK
    // =========================================
    if (!buyerId) {
      return res
          .status(401)
          .json({
        success: false,
        message:
            'Buyer authentication required',
      });
    }


    // =========================================
    // ONLY BUYERS CAN PLACE ORDERS
    // =========================================
    if (
      req.user.userType &&
      req.user.userType !==
          'Buyer'
    ) {
      return res
          .status(403)
          .json({
        success: false,
        message:
            'Only buyers can place orders',
      });
    }


    // =========================================
    // ADDRESS VALIDATION
    // =========================================
    if (
      !shippingAddress ||
      !shippingAddress.trim()
    ) {
      return res
          .status(400)
          .json({
        success: false,
        message:
            'Shipping address is required',
      });
    }


    // =========================================
    // PAYMENT METHOD VALIDATION
    // =========================================
    const allowedPaymentMethods = [
      'Cash on Delivery',
      'Bank Transfer',
    ];


    if (
      !allowedPaymentMethods
          .includes(
        paymentMethod,
      )
    ) {
      return res
          .status(400)
          .json({
        success: false,
        message:
            'Invalid payment method',
      });
    }


    // =========================================
    // START DATABASE TRANSACTION
    // =========================================
    session.startTransaction();


    // =========================================
    // GET BUYER CART
    // =========================================
    const cart =
        await Cart.findOne({
      buyer: buyerId,
    }).session(session);


    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      await session
          .abortTransaction();


      return res
          .status(400)
          .json({
        success: false,
        message:
            'Your cart is empty',
      });
    }


    // =========================================
    // CHECK STOCK AND REDUCE STOCK
    // =========================================
    for (
      const item
      of cart.items
    ) {
      const stock =
          await Stock
              .findOneAndUpdate(
        {
          _id:
              item.stockId,

          currentAmount: {
            $gte:
                item.quantity,
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
        const error =
            new Error(
          `Not enough stock available for ${item.name}`,
        );


        error.statusCode =
            400;


        throw error;
      }
    }


    // =========================================
    // COPY CART ITEMS TO ORDER
    // =========================================
    const orderItems =
        cart.items.map(
      (item) => ({
        stockId:
            item.stockId,

        name:
            item.name,

        image:
            item.image || '',

        quantity:
            item.quantity,

        price:
            item.price,
      }),
    );


    // =========================================
    // CREATE ORDER
    // =========================================
    const createdOrders =
        await Order.create(
      [
        {
          buyerId:
              buyerId,

          items:
              orderItems,

          shippingAddress:
              shippingAddress
                  .trim(),

          paymentMethod:
              paymentMethod,

          status:
              'Pending',
        },
      ],
      {
        session,
      },
    );


    const order =
        createdOrders[0];


    // =========================================
    // CLEAR CART
    // =========================================
    cart.items = [];

    cart.total = 0;


    await cart.save({
      session,
    });


    // =========================================
    // COMMIT TRANSACTION
    // =========================================
    await session
        .commitTransaction();


    return res
        .status(201)
        .json({
      success: true,

      message:
          'Order placed successfully',

      order:
          order,
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session
          .abortTransaction();
    }


    console.error(
      'Create order error:',
      error,
    );


    return res
        .status(
      error.statusCode ||
          500,
    )
        .json({
      success: false,

      message:
          error.message ||
              'Failed to create order',
    });
  } finally {
    await session
        .endSession();
  }
};


// =========================================================
// GET LOGGED-IN BUYER'S ORDERS
// =========================================================
const getMyOrders = async (
  req,
  res,
) => {
  try {
    const buyerId =
        req.user.id;


    if (!buyerId) {
      return res
          .status(401)
          .json({
        success: false,
        message:
            'Buyer authentication required',
      });
    }


    const orders =
        await Order.find({
      buyerId:
          buyerId,
    }).sort({
      createdAt: -1,
    });


    return res
        .status(200)
        .json({
      success: true,
      orders:
          orders,
    });
  } catch (error) {
    console.error(
      'Get my orders error:',
      error,
    );


    return res
        .status(500)
        .json({
      success: false,
      message:
          'Failed to fetch orders',
    });
  }
};


// =========================================================
// GET SINGLE ORDER BY ID
// =========================================================
const getOrderById = async (
  req,
  res,
) => {
  try {
    const buyerId =
        req.user.id;

    const orderId =
        req.params.orderId;


    const order =
        await Order.findOne({
      _id:
          orderId,

      buyerId:
          buyerId,
    });


    if (!order) {
      return res
          .status(404)
          .json({
        success: false,
        message:
            'Order not found',
      });
    }


    return res
        .status(200)
        .json({
      success: true,

      order:
          order,
    });
  } catch (error) {
    console.error(
      'Get order details error:',
      error,
    );


    return res
        .status(500)
        .json({
      success: false,

      message:
          'Failed to fetch order details',
    });
  }
};


// =========================================================
// GET ORDERS BY BUYER ID
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
      buyerId:
          buyerId,
    }).sort({
      createdAt: -1,
    });


    return res
        .status(200)
        .json({
      success: true,

      orders:
          orders,
    });
  } catch (error) {
    console.error(
      'Get orders error:',
      error,
    );


    return res
        .status(500)
        .json({
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
    const {
      status,
    } = req.body;


    const allowedStatuses = [
      'Pending',
      'Completed',
    ];


    if (
      !allowedStatuses
          .includes(
        status,
      )
    ) {
      return res
          .status(400)
          .json({
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
      return res
          .status(404)
          .json({
        success: false,

        message:
            'Order not found',
      });
    }


    await order.updateStatus(
      status,
    );


    return res
        .status(200)
        .json({
      success: true,

      message:
          'Order status updated successfully',

      order:
          order,
    });
  } catch (error) {
    console.error(
      'Update order error:',
      error,
    );


    return res
        .status(500)
        .json({
      success: false,

      message:
          'Failed to update order status',
    });
  }
};


// =========================================================
// EXPORT
// =========================================================
module.exports = {
  createOrder,

  getMyOrders,

  getOrderById,

  getOrdersByBuyer,

  updateOrderStatus,
};