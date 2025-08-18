// const mongoose = require('mongoose');
// const Order = require('../models/Order');
// const Cart = require('../models/Cart');
// const Stock = require('../models/Stock'); 

// // Create order from cart
// exports.createOrder = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     const { shippingAddress, paymentMethod } = req.body;
    
//     // Validate input
//     if (!shippingAddress || !paymentMethod) {
//       await session.abortTransaction();
//       return res.status(400).json({ 
//         success: false,
//         message: 'Shipping address and payment method are required' 
//       });
//     }
    
//     // Get cart with populated products and their stock information
//     const cart = await Cart.findOne({ buyer: req.user.id })
//       .populate({
//         path: 'items.product',
//         select: 'name price harvestId quantity',
//         populate: {
//           path: 'harvestId',
//           model: 'Stock',
//           select: 'currentAmount totalAmount cropName'
//         }
//       })
//       .session(session);
      
//     if (!cart || cart.items.length === 0) {
//       await session.abortTransaction();
//       return res.status(400).json({ 
//         success: false,
//         message: 'Cart is empty' 
//       });
//     }
    
//     // Validate stock availability and prepare order items
//     const orderItems = [];
//     const stockUpdates = [];
//     const stockErrors = [];
    
//     for (const item of cart.items) {
//       try {
//         if (!item.product.harvestId) {
//           throw new Error(`Product ${item.product.name} is not properly linked to stock`);
//         }

//         const stock = item.product.harvestId;
//         if (!stock) {
//           throw new Error(`Stock record not found for product ${item.product.name}`);
//         }
        
//         // Convert quantities to numbers to ensure proper comparison
//         const availableStock = Number(stock.currentAmount || stock.totalAmount);
//         const requestedQuantity = Number(item.quantity);
        
//         if (availableStock < requestedQuantity) {
//           throw new Error(`Insufficient stock for ${item.product.name}. Available: ${availableStock}, Requested: ${requestedQuantity}`);
//         }
        
//         // Verify product has enough quantity
//         if (item.product.quantity < requestedQuantity) {
//           throw new Error(`Product ${item.product.name} quantity is insufficient. Available: ${item.product.quantity}, Requested: ${requestedQuantity}`);
//         }
        
//         orderItems.push({
//           productId: item.product._id,
//           harvestId: stock._id,
//           quantity: requestedQuantity,
//           price: item.price,
//           name: item.product.name
//         });
        
//         stockUpdates.push({
//           stockId: stock._id,
//           quantity: requestedQuantity
//         });
//       } catch (error) {
//         stockErrors.push({
//           product: item.product?.name || 'Unknown product',
//           error: error.message
//         });
//       }
//     }
    
//     // If any stock errors, abort the transaction
//     if (stockErrors.length > 0) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: 'Stock validation failed',
//         errors: stockErrors
//       });
//     }
    
//     // Create order
//     const order = new Order({
//       buyerId: req.user.id,
//       items: orderItems,
//       totalAmount: cart.total,
//       shippingAddress,
//       paymentMethod,
//       status: 'pending'
//     });
    
//     await order.save({ session });
    
//     // Update stock amounts
//     for (const update of stockUpdates) {
//       await Stock.findByIdAndUpdate(
//         update.stockId,
//         { $inc: { currentAmount: -update.quantity } },
//         { session }
//       );
//     }
    
//     // Clear cart
//     await Cart.findOneAndUpdate(
//       { buyer: req.user.id },
//       { $set: { items: [], total: 0 } },
//       { session }
//     );
    
//     await session.commitTransaction();
    
//     res.status(201).json({
//       success: true,
//       message: 'Order created successfully',
//       order,
//       stockUpdates: stockUpdates.map(update => ({
//         stockId: update.stockId,
//         quantityDeducted: update.quantity
//       }))
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Order creation error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Error creating order',
//       error: error.message 
//     });
//   } finally {
//     session.endSession();
//   }
// };

// // Get buyer's orders
// exports.getOrders = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userType = req.user.userType;

//     let query = {};
//     let populateOptions = {
//       path: 'items.productId',
//       select: 'name image price'
//     };

//     if (userType !== 'Super Admin') {
//       query.buyerId = userId;
//     }

//     const orders = await Order.find(query)
//       .sort({ createdAt: -1 })
//       .populate(populateOptions)
//       .lean();

//     // Format response data
//     const formattedOrders = orders.map(order => ({
//       ...order,
//       items: order.items.map(item => ({
//         ...item,
//         totalPrice: (item.quantity * item.price).toFixed(2)
//       }))
//     }));

//     res.status(200).json({
//       success: true,
//       count: formattedOrders.length,
//       orders: formattedOrders
//     });
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Error fetching orders',
//       error: error.message 
//     });
//   }
// };

// // Get order by ID
// exports.getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({ 
//       _id: req.params.id, 
//       buyerId: req.user.id 
//     })
//     .populate({
//       path: 'items.productId',
//       select: 'name image description price'
//     })
//     .lean();

//     if (!order) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Order not found' 
//       });
//     }
    
//     // Calculate item totals and order summary
//     const itemsWithTotals = order.items.map(item => ({
//       ...item,
//       itemTotal: (item.quantity * item.price).toFixed(2)
//     }));

//     const orderSummary = {
//       ...order,
//       items: itemsWithTotals,
//       subtotal: order.totalAmount.toFixed(2)
//     };

//     res.status(200).json({
//       success: true,
//       order: orderSummary
//     });
//   } catch (error) {
//     console.error('Error fetching order:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Error fetching order',
//       error: error.message 
//     });
//   }
// };

// // Delete order by ID
// exports.deleteOrder = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const order = await Order.findOneAndDelete({ 
//       _id: req.params.id, 
//       buyerId: req.user.id 
//     }).session(session);

//     if (!order) {
//       await session.abortTransaction();
//       return res.status(404).json({ 
//         success: false,
//         message: 'Order not found or not authorized to delete' 
//       });
//     }

//     // If you need to restore stock quantities, you would do it here
//     // await Stock.updateMany(
//     //   { _id: { $in: order.items.map(item => item.harvestId) } },
//     //   { $inc: { currentAmount: item.quantity } },
//     //   { session }
//     // );

//     await session.commitTransaction();
//     res.status(200).json({ 
//       success: true,
//       message: 'Order deleted successfully',
//       deletedOrderId: order._id 
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Error deleting order:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Error deleting order',
//       error: error.message 
//     });
//   } finally {
//     session.endSession();
//   }
// };

// // Update order status
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Only allow changing from pending to complete
//     const updatedOrder = await Order.findOneAndUpdate(
//       { 
//         _id: orderId, 
//         status: 'pending' 
//       },
//       { $set: { status: 'complete' } },
//       { new: true, runValidators: true }
//     ).populate('items.productId', 'name');

//     if (!updatedOrder) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Order not found or already completed' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Order marked as complete',
//       order: updatedOrder
//     });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Error updating order status',
//       error: error.message 
//     });
//   }
// };

const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({
      buyer: req.body.buyer,
      items: req.body.items,
      total: req.body.total,
      status: 'Pending'
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order details by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all orders for a buyer
exports.getOrdersByBuyer = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.params.buyer });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};