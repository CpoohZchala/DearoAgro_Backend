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

    const buyerId =
      req.user.id;


    const {
      shippingAddress,
      paymentMethod,
    } = req.body;


    // =====================================================
    // BUYER CHECK
    // =====================================================

    if (!buyerId) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            'Buyer authentication required',

        });
    }


    // =====================================================
    // BUYER TYPE CHECK
    // =====================================================

    if (
      req.user.userType &&
      req.user.userType !==
        'Buyer'
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            'Only buyers can place orders',

        });
    }


    // =====================================================
    // ADDRESS
    // =====================================================

    if (
      !shippingAddress ||
      !shippingAddress.trim()
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            'Shipping address is required',

        });
    }


    // =====================================================
    // PAYMENT
    // =====================================================

    const allowedPaymentMethods = [

      'Cash on Delivery',

      'Bank Transfer',

    ];


    if (
      !allowedPaymentMethods
        .includes(
          paymentMethod
        )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            'Invalid payment method',

        });
    }


    // =====================================================
    // START TRANSACTION
    // =====================================================

    session.startTransaction();


    // =====================================================
    // GET CART
    // =====================================================

    const cart =
      await Cart.findOne({

        buyer:
          buyerId,

      }).session(
        session
      );


    if (
      !cart ||
      !cart.items ||
      cart.items.length ===
        0
    ) {

      await session
        .abortTransaction();


      return res
        .status(400)
        .json({

          success:
            false,

          message:
            'Your cart is empty',

        });
    }


    // =====================================================
    // CHECK + REDUCE STOCK
    // =====================================================

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
              new:
                true,

              session,
            },

          );


      // ---------------------------------------------------
      // STOCK NOT AVAILABLE
      // ---------------------------------------------------

      if (!stock) {

        const error =
          new Error(

            `Not enough stock available for ${item.name}`

          );


        error.statusCode =
          400;


        throw error;
      }


      // ===================================================
      // AUTO UNLIST WHEN STOCK BECOMES ZERO
      // ===================================================

      if (
        Number(
          stock.currentAmount
        ) <= 0
      ) {

        stock.currentAmount =
          0;


        stock.isProductListed =
          false;


        await stock.save({

          session,

        });
      }
    }


    // =====================================================
    // COPY CART ITEMS
    // =====================================================

    const orderItems =
      cart.items.map(

        (item) => ({

          stockId:
            item.stockId,

          name:
            item.name,

          image:
            item.image ||
            '',

          quantity:
            item.quantity,

          price:
            item.price,

        })

      );


    // =====================================================
    // CREATE ORDER
    // =====================================================

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


    // =====================================================
    // CLEAR CART
    // =====================================================

    cart.items = [];

    cart.total = 0;


    await cart.save({

      session,

    });


    // =====================================================
    // COMMIT
    // =====================================================

    await session
      .commitTransaction();


    return res
      .status(201)
      .json({

        success:
          true,

        message:
          'Order placed successfully',

        order:
          order,

      });

  } catch (error) {

    // =====================================================
    // ROLLBACK
    // =====================================================

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
        500
      )
      .json({

        success:
          false,

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
// ADMIN - GET ALL ORDERS
// =========================================================

const getAllOrders = async (
  req,
  res,
) => {

  try {

    if (
      req.user.userType ===
      'Buyer'
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            'You are not authorized to view all orders',

        });
    }


    const orders =
      await Order
        .find({})
        .sort({

          createdAt:
            -1,

        });


    return res
      .status(200)
      .json({

        success:
          true,

        count:
          orders.length,

        orders:
          orders,

      });

  } catch (error) {

    console.error(

      'Get all orders error:',

      error,

    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Failed to fetch orders',

      });
  }
};


// =========================================================
// GET LOGGED-IN BUYER ORDERS
// =========================================================

const getMyOrders = async (
  req,
  res,
) => {

  try {

    const buyerId =
      req.user.id;


    const orders =
      await Order
        .find({

          buyerId:
            buyerId,

        })
        .sort({

          createdAt:
            -1,

        });


    return res
      .status(200)
      .json({

        success:
          true,

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

        success:
          false,

        message:
          'Failed to fetch orders',

      });
  }
};


// =========================================================
// GET SINGLE ORDER
// =========================================================

const getOrderById = async (
  req,
  res,
) => {

  try {

    const orderId =
      req.params.orderId;


    let order;


    // Buyer can only access own order
    if (
      req.user.userType ===
      'Buyer'
    ) {

      order =
        await Order.findOne({

          _id:
            orderId,

          buyerId:
            req.user.id,

        });

    } else {

      order =
        await Order.findById(
          orderId
        );
    }


    if (!order) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            'Order not found',

        });
    }


    return res
      .status(200)
      .json({

        success:
          true,

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

        success:
          false,

        message:
          'Failed to fetch order details',

      });
  }
};


// =========================================================
// GET ORDERS BY BUYER
// =========================================================

const getOrdersByBuyer = async (
  req,
  res,
) => {

  try {

    const buyerId =
      req.params.buyerId;


    const orders =
      await Order
        .find({

          buyerId:
            buyerId,

        })
        .sort({

          createdAt:
            -1,

        });


    return res
      .status(200)
      .json({

        success:
          true,

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

        success:
          false,

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

    if (
      req.user.userType ===
      'Buyer'
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

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
      !allowedStatuses
        .includes(
          status
        )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            'Invalid order status',

        });
    }


    const order =
      await Order.findById(

        req.params.orderId

      );


    if (!order) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            'Order not found',

        });
    }


    await order.updateStatus(
      status
    );


    return res
      .status(200)
      .json({

        success:
          true,

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

        success:
          false,

        message:
          'Failed to update order status',

      });
  }
};


// =========================================================
// DELETE ORDER
// =========================================================

const deleteOrder = async (
  req,
  res,
) => {

  const session =
    await mongoose.startSession();


  try {

    if (
      req.user.userType ===
      'Buyer'
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            'You are not authorized to delete orders',

        });
    }


    session.startTransaction();


    const order =
      await Order.findById(

        req.params.orderId

      ).session(
        session
      );


    if (!order) {

      await session
        .abortTransaction();


      return res
        .status(404)
        .json({

          success:
            false,

          message:
            'Order not found',

        });
    }


    // =====================================================
    // RETURN STOCK ONLY IF PENDING ORDER IS DELETED
    // =====================================================

    if (
      order.status ===
      'Pending'
    ) {

      for (
        const item
        of order.items
      ) {

        const stock =
          await Stock
            .findByIdAndUpdate(

              item.stockId,

              {
                $inc: {

                  currentAmount:
                    item.quantity,

                },
              },

              {
                new:
                  true,

                session,
              },

            );


        // If stock returns,
        // we intentionally DON'T auto-list it.
        // Admin can decide whether to list again.

        if (stock) {

          stock.currentAmount =
            Math.max(
              0,

              Number(
                stock.currentAmount ||
                0
              )
            );


          await stock.save({

            session,

          });
        }
      }
    }


    await Order.deleteOne(

      {
        _id:
          order._id,
      },

      {
        session,
      },

    );


    await session
      .commitTransaction();


    return res
      .status(200)
      .json({

        success:
          true,

        message:
          'Order deleted successfully',

        deletedOrderId:
          order._id,

      });

  } catch (error) {

    if (
      session.inTransaction()
    ) {

      await session
        .abortTransaction();
    }


    console.error(

      'Delete order error:',

      error,

    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Failed to delete order',

      });

  } finally {

    await session
      .endSession();
  }
};


// =========================================================
// EXPORTS
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