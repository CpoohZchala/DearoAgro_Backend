const express = require('express');
const { getAllProducts, getProductById } = require('../controllers/productController');

const router = express.Router();

// Route to get all products
router.get('/', getAllProducts);

// Route to get a product by ID
router.get('/:id', getProductById);

module.exports = router;