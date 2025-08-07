const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    // Validate input
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }
    
    // Get cart
    const cart = await Cart.findOne({ buyer: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Create order items from cart items
    const orderItems = cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));
    
    // Create order
    const order = new Order({
      buyerId: req.user.id,
      items: orderItems,
      totalAmount: cart.total,
      shippingAddress,
      paymentMethod
    });
    
    await order.save();
    console.log('Order created:', order);
    
    // Clear cart
    await Cart.findOneAndUpdate(
      { buyer: req.user.id },
      { $set: { items: [], total: 0 } }
    );
    
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
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
        .populate('items.productId', 'name image')
        .populate('buyerId', 'fullName');
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