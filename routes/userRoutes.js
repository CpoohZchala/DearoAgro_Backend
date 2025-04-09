const express = require("express");
const User = require("../models/User");
const router = express.Router();


// Get User Profile
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.send(user);
});


// Update User Profile
router.put("/:id", async (req, res) => {
  try {
    const { fullName, userType, profileImage } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, userType },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
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
