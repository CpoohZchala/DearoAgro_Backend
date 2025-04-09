const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require("fs");
const path = require("path");



// Get User Profile
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.send(user);
});


// Update User Profile and Password
router.put("/:id", async (req, res) => {
  try {
    const { fullName, userType, mobileNumber, oldPassword, newPassword, profileImage } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password if old and new passwords are provided
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update other profile fields
    if (fullName) user.fullName = fullName;
    if (userType) user.userType = userType;
    if (mobileNumber) user.mobileNumber = mobileNumber;

    // ✅ Add this to support image updates
    if (profileImage) {
      user.profileImage = profileImage;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});



//Delete Profile 
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
