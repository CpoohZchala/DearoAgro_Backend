const express = require('express');
const bcrypt = require('bcryptjs');
const Buyer = require('../models/Buyer');

const router = express.Router();

// Register a new buyer
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobileNumber, password } = req.body;

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
      password: hashedPassword
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

    res.status(200).json({ message: 'Login successful', buyer });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all buyers
router.get('/', async (req, res) => {
  try {
    const buyers = await Buyer.find();
    res.status(200).json(buyers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch buyers' });
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

module.exports = router;