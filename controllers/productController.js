const Product = require("../models/Product");
const Stock = require("../models/Stock");

// Fetch all products with stock information
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('stockId', 'currentAmount totalAmount');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching products",
      error: error.message 
    });
  }
};

// Fetch product by ID with stock details
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('stockId');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching product by ID",
      error: error.message 
    });
  }
};

// Add a new product with automatic stock creation
exports.addProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, price, image, category, quantity, harvestId } = req.body;

    // Validate input
    if (!name || !price || !image || !category || quantity === undefined || !harvestId) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: "All fields including harvestId are required" 
      });
    }

    // Create new stock record
    const stock = new Stock({
      cropName: name,
      totalAmount: quantity,
      currentAmount: quantity,
      pricePerKg: price,
      memberId: req.user.id || 'system-auto'
    });
    await stock.save({ session });

    // Create product with stock reference
    const product = new Product({ 
      name, 
      price, 
      image, 
      category, 
      quantity,
      harvestId,
      stockId: stock._id
    });
    await product.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      product,
      stockInfo: {
        stockId: stock._id,
        currentAmount: stock.currentAmount,
        totalAmount: stock.totalAmount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      message: "Error adding product",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Update a product by ID with stock synchronization
exports.updateProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, price, image, category, quantity, harvestId } = req.body;
    const productId = req.params.id;

    if (!productId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found" });
    }

    // Update stock if quantity changes
    if (quantity !== undefined && quantity !== product.quantity && product.stockId) {
      const stock = await Stock.findById(product.stockId).session(session);
      if (stock) {
        const quantityDiff = quantity - product.quantity;
        stock.totalAmount += quantityDiff;
        stock.currentAmount += quantityDiff;
        await stock.save({ session });
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, price, image, category, quantity, harvestId },
      { new: true, session }
    );

    await session.commitTransaction();
    res.status(200).json(updatedProduct);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      message: "Error updating product",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Delete a product by ID with associated stock
exports.deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productId = req.params.id;
    if (!productId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated stock if exists
    if (product.stockId) {
      await Stock.findByIdAndDelete(product.stockId).session(session);
    }

    // Delete product
    await Product.findByIdAndDelete(productId).session(session);

    await session.commitTransaction();
    res.status(200).json({ message: "Product and associated stock deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      message: "Error deleting product",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// DELETE product by harvestId with stock cleanup
exports.deleteByHarvestId = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const harvestId = req.params.harvestId;
    const product = await Product.findOne({ harvestId }).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete associated stock if exists
    if (product.stockId) {
      await Stock.findByIdAndDelete(product.stockId).session(session);
    }

    // Delete product
    await Product.findOneAndDelete({ harvestId }).session(session);

    await session.commitTransaction();
    res.json({ success: true, message: 'Product and associated stock removed successfully' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  } finally {
    session.endSession();
  }
};

// Additional helper method to ensure product-stock linkage
exports.ensureStockLinkage = async (req, res) => {
  try {
    const products = await Product.find({ stockId: { $exists: false } });
    const results = [];

    for (const product of products) {
      const stock = new Stock({
        cropName: product.name,
        totalAmount: product.quantity || 0,
        currentAmount: product.quantity || 0,
        pricePerKg: product.price || 0,
        memberId: 'system-repair'
      });
      await stock.save();

      product.stockId = stock._id;
      await product.save();

      results.push({
        productId: product._id,
        stockId: stock._id,
        status: 'linked'
      });
    }

    res.status(200).json({
      message: 'Stock linkage completed',
      repairedCount: results.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error ensuring stock linkage',
      error: error.message
    });
  }
};