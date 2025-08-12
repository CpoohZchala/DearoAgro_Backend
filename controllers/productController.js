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
    const { name, price, image, category, quantity } = req.body;

    // Validate input (add quantity validation)
    if (!name || !price || !image || !category || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new product
    const product = new Product({ name, price, image, category, quantity });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  const { name, price, image, category, quantity } = req.body;

  const productId = req.params.id;

  // Log the received ID
  console.log("Received product ID:", productId);

  // Validate ID
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, price, image, category, quantity },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  // Log the received ID
  console.log("Received product ID for deletion:", productId);

  // Validate ID
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
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
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


