const express = require("express");
const CropData = require("../models/CropUpdate");

const router = express.Router();


// Submit Form Data
router.post("/cropsubmit", async (req, res) => {
  try {
    const { description, fertilizerType, fertilizerAmount, fertilizerUnit } = req.body;

    if (description === "පොහොර යෙදීම") {
      if (
        !fertilizerType ||
        fertilizerType.trim() === "" ||
        fertilizerAmount === undefined ||
        fertilizerAmount === null ||
        fertilizerAmount === "" ||
        isNaN(Number(fertilizerAmount)) ||
        !fertilizerUnit ||
        fertilizerUnit.trim() === ""
      ) {
        return res.status(400).json({ error: "Fertilizer details required" });
      }
    }

    const cropData = new CropData(req.body);
    await cropData.save();
    res.status(201).json({ message: "Data submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit data" });
  }
});

// Fetch data by user ID
router.get("/cropfetch/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const data = await CropData.find({ memberId: userId });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No data found for this user" });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


// Update 
router.put("/cropupdate", async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    const updatedData = await CropData.findByIdAndUpdate(_id, updateData, { new: true });
    
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
router.delete("/cropdelete/:id", async (req, res) => {
  try {
    const result = await CropData.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: "Data not found" });
    }
    
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data" });
  }
});


module.exports = router;
