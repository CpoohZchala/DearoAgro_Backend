const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// GET all stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ createdAt: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Fetch stocks by user ID (following your cultivation pattern)
router.get("/fetch/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const stocks = await Stock.find({ memberId: userId }).sort({ createdAt: -1 });

    if (!stocks || stocks.length === 0) {
      return res.status(404).json({ error: "No stocks found for this user" });
    }

    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by user ID:', error);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// GET stock by ID
router.get('/:id', async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ error: 'Stock not found' });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock by ID' });
  }
});

// POST create new stock - Updated to include all fields
router.post('/', async (req, res) => {
  try {
    console.log('Received body:', req.body);
    
    const {
      memberId,
      fullName,
      mobileNumber,
      address,
      cropName,
      totalAmount,
      pricePerKg,
      harvestDate,
      currentPrice,
      quantity
    } = req.body;

    // Validate required fields
    if (!memberId) {
      return res.status(400).json({ 
        error: 'memberId is required',
        received: req.body 
      });
    }

    const newStock = new Stock({
      memberId,
      fullName,
      mobileNumber,
      address,
      cropName,
      totalAmount,
      pricePerKg,
      harvestDate,
      currentPrice: currentPrice || 0,
      quantity: quantity || 0
    });

    await newStock.save();
    res.status(201).json({ 
      message: 'Stock created successfully',
      data: newStock
    });
  } catch (err) {
    console.error('Stock creation error:', err);
    res.status(400).json({ 
      error: 'Failed to create stock',
      details: err.message
    });
  }
});

// Update stock
router.put("/update", async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Stock ID is required" });
    }

    const updatedStock = await Stock.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true
    });
    
    if (!updatedStock) {
      return res.status(404).json({ error: "Stock not found" });
    }
    
    res.status(200).json({ 
      message: "Stock updated successfully",
      data: updatedStock
    });
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ 
      error: "Failed to update stock",
      details: error.message
    });
  }
});

// DELETE stock by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const result = await Stock.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: "Stock not found" });
    }
    
    res.status(200).json({ 
      message: "Stock deleted successfully",
      deletedStock: result
    });
  } catch (err) {
    console.error('Stock deletion error:', err);
    res.status(500).json({ 
      error: 'Failed to delete stock',
      details: err.message
    });
  }
});

// Toggle product listing
router.put('/toggle/:id', async (req, res) => {
  try {
    const { isProductListed } = req.body;

    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      { isProductListed },
      { new: true, runValidators: true }
    );

    if (!updatedStock) {
      return res.status(404).json({ error: "Stock not found" });
    }

    res.status(200).json({
      message: "Product listing status updated",
      data: updatedStock
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ error: "Failed to update product status" });
  }
});


module.exports = router;
