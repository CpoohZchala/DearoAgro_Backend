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
// Updated addProduct
exports.addProduct = async (req, res) => {
  try {
    const { name, price, image, category, quantity, harvestId } = req.body;

    // Only validate required fields
    if (!name || !image || !category) {
      return res.status(400).json({ message: "Name, image, and category are required" });
    }

    // Create product with defaults for missing fields
    const product = new Product({ 
      name, 
      image, 
      category,
      price: price || 0,
      quantity: quantity || 0,
      harvestId: harvestId || null
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};

// Updated updateProduct
exports.updateProduct = async (req, res) => {
  const { name, price, image, category, quantity, harvestId } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update only the fields that are provided
    if (name !== undefined) product.name = name;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (harvestId !== undefined) product.harvestId = harvestId;

    await product.save();
    res.status(200).json(product);
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
