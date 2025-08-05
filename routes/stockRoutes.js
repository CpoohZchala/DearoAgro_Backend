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

// POST create new stock
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      address,
      cropName,
      totalAmount,
      pricePerKg,
      harvestDate
    } = req.body;

    const newStock = new Stock({
      fullName,
      mobileNumber,
      address,
      cropName,
      totalAmount,
      pricePerKg,
      harvestDate
    });

    await newStock.save();
    res.status(201).json({ message: 'Stock created successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create stock' });
  }
});

// PUT update stock by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedStock) return res.status(404).json({ error: 'Stock not found' });

    res.json({ message: 'Stock updated successfully', stock: updatedStock });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update stock' });
  }
});

// DELETE stock by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);
    if (!deletedStock) return res.status(404).json({ error: 'Stock not found' });

    res.json({ message: 'Stock deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stock' });
  }
});

module.exports = router;
