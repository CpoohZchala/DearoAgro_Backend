const Product = require("../models/Product");

// Fetch all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Fetch product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product by ID" });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, image, category, quantity, harvestId } = req.body;

    // Validate input (including harvestId)
    if (!name || !price || !image || !category || quantity === undefined || !harvestId) {
      return res.status(400).json({ message: "All fields including harvestId are required" });
    }

    // Create a new product
    const product = new Product({ name, price, image, category, quantity, harvestId });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  const { name, price, image, category, quantity, harvestId } = req.body;
  const productId = req.params.id;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  if (!harvestId) {
    return res.status(400).json({ message: "Harvest ID is required" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, price, image, category, quantity, harvestId },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// DELETE product by harvestId
exports.deleteByHarvestId = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ harvestId: req.params.harvestId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (err) {
    console.error('Error deleting product by harvestId:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// controllers/productController.js
const Product = require("../models/Product");

// Add this new method for simplified crop creation
exports.addCrop = async (req, res) => {
  try {
    const { name, category, image } = req.body;
    
    if (!name || !category || !image) {
      return res.status(400).json({ message: "Name, category and image are required" });
    }

    const product = new Product({ 
      name, 
      category, 
      image,
      price: 0,
      quantity: 0,
      harvestId: null
    });
    
    await product.save();
    res.status(201).json({ name, category, image, _id: product._id });
  } catch (error) {
    res.status(500).json({ message: "Error adding crop" });
  }
};

// Make sure all other exports are present...
exports.getAllProducts = async (req, res) => { /* ... */ };
exports.getProductById = async (req, res) => { /* ... */ };
exports.addProduct = async (req, res) => { /* ... */ };
exports.updateProduct = async (req, res) => { /* ... */ };
exports.deleteProduct = async (req, res) => { /* ... */ };
exports.deleteByHarvestId = async (req, res) => { /* ... */ };

// Add this if using Solution 3
exports.updateCrop = async (req, res) => {
  try {
    const { name, category, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, image },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ message: "Crop not found" });
    res.status(200).json({ name, category, image, _id: product._id });
  } catch (error) {
    res.status(500).json({ message: "Error updating crop" });
  }
};
