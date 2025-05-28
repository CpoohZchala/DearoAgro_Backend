const Product = require('../models/Product');

// Fetch all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Fetch product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product by ID' });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, price, image, category } = req.body;

        // Validate input
        if (!name || !price || !image || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new product
        const product = new Product({ name, price, image, category });
        await product.save();

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product' });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  const { name, price, image, category } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image, category },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};
