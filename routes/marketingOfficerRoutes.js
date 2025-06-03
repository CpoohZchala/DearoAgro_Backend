const express = require('express');
const bcrypt = require('bcryptjs');
const MarketingOfficer = require('../models/MarketingOfficer');

const router = express.Router();

// Register a new marketing officer
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobileNumber, password, profileImage,branchName } = req.body;

    if (!fullName || !mobileNumber || !password ||!branchName ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if marketing officer already exists
    const existingOfficer = await MarketingOfficer.findOne({ mobileNumber });
    if (existingOfficer) {
      return res.status(400).json({ error: 'Mobile number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const officer = new MarketingOfficer({
      fullName,
      mobileNumber,
      password: hashedPassword,
      profileImage,
      branchName
    });

    await officer.save();
    res.status(201).json({ message: 'Marketing Officer registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Marketing officer login
router.post('/login', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    const officer = await MarketingOfficer.findOne({ mobileNumber });

    if (!officer) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Exclude password from response
    const { password: _, ...officerData } = officer.toObject();
    res.status(200).json({ message: 'Login successful', officer: officerData });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all marketing officers (exclude password)
router.get('/', async (req, res) => {
  try {
    const officers = await MarketingOfficer.find().select('-password');
    res.status(200).json(officers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch marketing officers' });
  }
});

// Get a single marketing officer by ID (exclude password)
router.get('/:id', async (req, res) => {
  try {
    const officer = await MarketingOfficer.findById(req.params.id).select('-password');
    if (!officer) {
      return res.status(404).json({ message: 'Marketing Officer not found' });
    }
    res.json(officer);
  } catch (error) {
    console.error('Error fetching marketing officer:', error);
    res.status(500).json({ message: 'Failed to fetch marketing officer' });
  }
});


// Delete a marketing officer by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await MarketingOfficer.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Marketing Officer not found' });
    }
    res.status(200).json({ message: 'Marketing Officer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete marketing officer' });
  }
});


// Update a marketing officer by ID
router.put('/:id', async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { fullName, mobileNumber, profileImage, branchName } = req.body;
    const updatedOfficer = await MarketingOfficer.findByIdAndUpdate(
      req.params.id,
      { fullName, mobileNumber, profileImage, branchName },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!updatedOfficer) {
      return res.status(404).json({ error: 'Marketing Officer not found' });
    }
    res.status(200).json({ message: 'Marketing Officer updated successfully', officer: updatedOfficer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update marketing officer' });
  }
});


// Change password for a marketing officer
router.post('/:id/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const officer = await MarketingOfficer.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ message: 'Marketing Officer not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, officer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Update to new password
    officer.password = await bcrypt.hash(newPassword, 10);
    await officer.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;