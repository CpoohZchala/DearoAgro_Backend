const express = require('express');
const mongoose = require('mongoose'); 
const SuperAdmin = require('../models/SuperAdmin');
const router = express.Router();

// Get Super Admin Profile
router.get('/:id', async (req, res) => {
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const superAdmin = await SuperAdmin.findById(req.params.id).select('-password'); // Exclude password
    if (!superAdmin) {
      return res.status(404).json({ message: 'Super Admin not found' });
    }
    res.json(superAdmin);
  } catch (error) {
    console.error('Error fetching Super Admin profile:', error.message);
    res.status(500).json({ message: 'Failed to fetch Super Admin profile', error: error.message });
  }
});

module.exports = router;