const express = require('express');
const CartController = require('../controllers/cartController'); 

const cartController = new CartController();

const router = express.Router();

router.post('/add', cartController.addToCart); 
router.delete('/remove/:id', cartController.removeFromCart); 
router.get('/', cartController.getCart); 

module.exports = router;