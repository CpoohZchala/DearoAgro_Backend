const express = require('express');
const mongoose = require('mongoose');
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

// Check for duplicate mobileNumber before creating a new farmer
router.post('/', async (req, res) => {
  try {
    const { fullName, mobileNumber, password } = req.body;

    // Check if mobileNumber already exists
    const existingFarmer = await Farmer.findOne({ mobileNumber });
    if (existingFarmer) {
      return res.status(400).json({ message: 'Mobile number already exists' });
    }

    const newFarmer = new Farmer({ fullName, mobileNumber, password ,branchName });
    const savedFarmer = await newFarmer.save();
    console.log('Saved Farmer:', savedFarmer);
    res.status(201).json(savedFarmer);
  } catch (error) {
    console.error('Error creating farmer:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate key error: Mobile number already exists',
        keyValue: error.keyValue,
      });
    }

    res.status(500).json({ message: 'Failed to create farmer', error: error.message });
  }
});
  

// Update a farmer by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid farmer ID' });
    }

    const { fullName, mobileNumber ,profileImage } = req.body;
    
        const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (mobileNumber !== undefined) updateFields.mobileNumber = mobileNumber;
    if (profileImage !== undefined) updateFields.profileImage = profileImage; 

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!updatedFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    res.json(updatedFarmer);
  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({ 
      message: 'Failed to update farmer',
      error: error.message 
    });
  }
});


// Delete a farmer by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Check if ID is provided
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing farmer ID' });
  }

  try {
    const deletedFarmer = await Farmer.findByIdAndDelete(id);
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