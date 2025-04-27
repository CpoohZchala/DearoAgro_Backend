const express = require('express');
const Farmer = require('../models/Farmer');
const router = express.Router();

// Get all farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ message: 'Failed to fetch farmers' });
  }
});

// Get a single farmer by ID
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ message: 'Failed to fetch farmer' });
  }
});

router.post('/', async (req, res) => {
    try {
      const { fullName, mobileNumber, password } = req.body;
      const newFarmer = new Farmer({ fullName, mobileNumber, password });
      const savedFarmer = await newFarmer.save();  // <- await and save result
      console.log('Saved Farmer:', savedFarmer);   // <-- Add this line
      res.status(201).json(savedFarmer);
    } catch (error) {
      console.error('Error creating farmer:', error);
      res.status(500).json({ message: 'Failed to create farmer', error: error.message });
    }
  });
  

// Update a farmer by ID
router.put('/:id', async (req, res) => {
  try {
    const { fullName, mobileNumber } = req.body;
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { fullName, mobileNumber },
      { new: true }
    );
    if (!updatedFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(updatedFarmer);
  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({ message: 'Failed to update farmer' });
  }
});

// Delete a farmer by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedFarmer = await Farmer.findByIdAndDelete(req.params.id);
    if (!deletedFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({ message: 'Failed to delete farmer' });
  }
});

module.exports = router;