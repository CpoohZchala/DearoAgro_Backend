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
    console.log('Fetching orders for user ID:', req.user.id);
    const orders = await Order.find({ buyerId: req.user.id })  // Changed from buyer to buyerId
                            .sort({ createdAt: -1 })
                            .populate('items.productId', 'name image');  // Also changed from product to productId
    
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