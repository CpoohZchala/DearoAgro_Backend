const express = require("express");
const FormData = require("../models/Cultivational");

const router = express.Router();


// Submit Form Data
router.post("/submit", async (req, res) => {
  try {
    const formData = new FormData(req.body);
    await formData.save();
    res.status(201).json({ message: "Data submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit data" });
  }
});

// Fetch data by user ID
router.get("/fetch/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const data = await FormData.find({ memberId: userId });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No data found for this user" });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Update 
router.put("/update", async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const updatedData = await FormData.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedData) {
      return res.status(404).json({ error: "Data not found" });
    }
    
    res.status(200).json({ 
      message: "Data updated successfully",
      data: updatedData
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Delete 
router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await FormData.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: "Data not found" });
    }
    
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data" });
  }
});





module.exports = router;
