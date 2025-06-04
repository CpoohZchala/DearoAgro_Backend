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
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));
    
    // Create order
    const order = new Order({
      buyer: req.user.id,
      items: orderItems,
      total: cart.total,
      shippingAddress,
      paymentMethod
    });
    
    await order.save();
    
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
    const orders = await Order.find({ buyer: req.user.id })
                            .sort({ createdAt: -1 })
                            .populate('items.product', 'name image');
    
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
      buyer: req.user.id 
    }).populate('items.product', 'name image description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};