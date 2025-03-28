const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get User Profile
router.get("/api/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Update User Profile
router.put("/:id", async (req, res) => {
  try {
    const { fullName, userType, profileImage } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, userType, profileImage },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
