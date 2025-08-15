const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route to fetch all products
router.get('/', productController.getAllProducts);

// Route to fetch a product by ID
router.get('/:id', productController.getProductById);

// Route to add a new product
router.post('/', productController.addProduct);

// Route to update a product by ID
router.put('/:id', productController.updateProduct);

// Route to delete a product by ID
router.delete('/:id', productController.deleteProduct);

router.delete('/by-harvest/:harvestId', productController.deleteByHarvestId);

router.post('/crops', productController.addCrop);

router.put('/crops/:id', productController.updateCrop);



module.exports = router;
