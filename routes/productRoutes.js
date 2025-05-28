const express = require('express');
const { 
  getAllProducts, 
  getProductById, 
  addProduct, 
  deleteProduct,
  updateProduct 
} = require('../controllers/productController');

const router = express.Router();

router.get('/', getAllProducts);           // Get all products
router.get('/:id', getProductById);        // Get product by ID
router.post('/', addProduct);              // Add product
router.put('/:id', updateProduct);         // Update product by ID
router.delete('/:id', deleteProduct);      // Delete product by ID

module.exports = router;
