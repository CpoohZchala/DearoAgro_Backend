const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrderById 
} = require('../controllers/orderController');
const auth = require('../middleware/authenticate');

const router = express.Router();

// Protect all routes with buyer authentication
router.use(auth);
router.use((req, res, next) => {
  if (req.user.userType !== 'Buyer') {
    return res.status(403).json({ message: 'Access denied. Buyers only.' });
  }
  next();
});

router.post('/', createOrder);           // Create order
router.get('/', getOrders);              // Get all orders
router.get('/:id', getOrderById);        // Get order by ID

module.exports = router;