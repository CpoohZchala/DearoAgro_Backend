const express = require('express');
const bcrypt = require('bcryptjs');
const Buyer = require('../models/Buyer');

const router = express.Router();

// Register a new buyer
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobileNumber, password, profileImage } = req.body;

    if (!fullName || !mobileNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ mobileNumber });
    if (existingBuyer) {
      return res.status(400).json({ error: 'Mobile number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const buyer = new Buyer({
      fullName,
      mobileNumber,
      password: hashedPassword,
      profileImage 
    });

    await buyer.save();
    res.status(201).json({ message: 'Buyer registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Buyer login
router.post('/login', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    const buyer = await Buyer.findOne({ mobileNumber });

    if (!buyer) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Exclude password from response
    const { password: _, ...buyerData } = buyer.toObject();
    res.status(200).json({ message: 'Login successful', buyer: buyerData });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all buyers (exclude password)
router.get('/', async (req, res) => {
  try {
    const buyers = await Buyer.find().select('-password');
    res.status(200).json(buyers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// Get a single buyer by ID (exclude password)
router.get('/:id', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id).select('-password');
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    res.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({ message: 'Failed to fetch buyer' });
  }
});

// Delete a buyer by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Buyer.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(200).json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
});

// Update a buyer by ID
router.put('/:id', async (req, res) => {
  try {
    const { fullName, mobileNumber, profileImage } = req.body;
    // Do not allow password update here for security (handle separately if needed)
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      req.params.id,
      { fullName, mobileNumber, profileImage },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!updatedBuyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(200).json({ message: 'Buyer updated successfully', buyer: updatedBuyer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});


// Add this to your buyers route file (after your other routes)
router.post('/:id/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Update to new password
    buyer.password = await bcrypt.hash(newPassword, 10);
    await buyer.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;