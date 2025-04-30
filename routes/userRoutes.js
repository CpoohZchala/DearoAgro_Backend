const express = require("express");
const bcrypt = require('bcryptjs');
const Farmer = require('../models/Farmer');
const SuperAdmin = require('../models/SuperAdmin');
const MarketingOfficer = require('../models/MarketingOfficer');
const router = express.Router();

// Helper function to get the correct model based on userType
const getModelByUserType = (userType) => {
  switch (userType) {
    case 'Farmer':
      return Farmer;
    case 'Super Admin':
      return SuperAdmin;
    case 'Marketing Officer':
      return MarketingOfficer;
    default:
      throw new Error('Invalid user type');
  }
};

// Get User Profile
router.get('/:userType/:id', async (req, res) => {
  try {
    const { userType, id } = req.params;
    const Model = getModelByUserType(userType);

    const user = await Model.findById(id).select('-password');
    if (!user) {
      return res.status(404).send(`${userType} not found`);
    }

    res.json({
      fullName: user.fullName,
      userType: userType,
      profileImage: user.profileImage || "",
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Server error');
  }
});


// Update User Profile and Password
router.put('/:userType/:id', async (req, res) => {
  try {
    const { userType, id } = req.params;
    const { fullName, mobileNumber, oldPassword, newPassword, profileImage } = req.body;
    const Model = getModelByUserType(userType);

    const user = await Model.findById(id);
    if (!user) {
      return res.status(404).json({ message: `${userType} not found` });
    }

    // Update password if old and new passwords are provided
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect old password' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update other profile fields
    if (fullName) user.fullName = fullName;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();
    res.json(updatedUser);

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
});


// Delete Profile
router.delete('/:userType/:id', async (req, res) => {
  try {
    const { userType, id } = req.params;
    const Model = getModelByUserType(userType);

    const deletedUser = await Model.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: `${userType} not found` });
    }
    res.json({ message: `${userType} deleted successfully`, user: deletedUser });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
