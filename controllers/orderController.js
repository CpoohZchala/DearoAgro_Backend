const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create order from cart
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    // Validate input
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }
    
    // Get cart
    const cart = await Cart.findOne({ buyer: req.user.id })
      .populate('items.product')
      .session(session);
      
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Validate stock availability and prepare order items
    const orderItems = [];
    const stockUpdates = [];
    
    for (const item of cart.items) {
      const stock = await Stock.findById(item.product.stockId).session(session);
      if (!stock) {
        throw new Error(`Stock not found for product ${item.product.name}`);
      }
      
      if (stock.currentAmount < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}. Available: ${stock.currentAmount}, Requested: ${item.quantity}`);
      }
      
      orderItems.push({
        productId: item.product._id,
        stockId: item.product.stockId, // Add stockId to order items
        quantity: item.quantity,
        price: item.price,
        name: item.product.name
      });
      
      stockUpdates.push({
        stockId: stock._id,
        quantity: item.quantity
      });
    }
    
    // Create order
    const order = new Order({
      buyerId: req.user.id,
      items: orderItems,
      totalAmount: cart.total,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    });
    
    await order.save({ session });
    
    // Update stock amounts
    for (const update of stockUpdates) {
      await Stock.findByIdAndUpdate(
        update.stockId,
        { $inc: { currentAmount: -update.quantity } },
        { session }
      );
    }
    
    // Clear cart
    await Cart.findOneAndUpdate(
      { buyer: req.user.id },
      { $set: { items: [], total: 0 } },
      { session }
    );
    
    await session.commitTransaction();
    
    // Fetch updated stock data for response
    const updatedStocks = await Stock.find({
      _id: { $in: stockUpdates.map(u => u.stockId) }
    });
    
    res.status(201).json({
      order,
      updatedStocks: updatedStocks.map(s => ({
        stockId: s._id,
        currentAmount: s.currentAmount,
        totalAmount: s.totalAmount
      }))
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating order',
      error: error.toString() 
    });
  } finally {
    session.endSession();
  }
};


// Get buyer's orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType; // Make sure userType is set in your auth middleware

    let orders;

    if (userType === 'Super Admin') {
      // Super Admin sees all orders
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('items.productId', 'name image');
        
        
    } else {
      // Buyer sees only their own orders
      orders = await Order.find({ buyerId: userId })
        .sort({ createdAt: -1 })
        .populate('items.productId', 'name image');
        
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};



// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      buyerId: req.user.id 
    }).populate('items.productId', 'name image description');  // Changed from product to productId
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Delete order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ 
      _id: req.params.id, 
      buyerId: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized to delete' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'complete' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

