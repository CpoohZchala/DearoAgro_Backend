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

// Fetch Submitted Data
router.get("/fetch", async (req, res) => {
  try {
    const data = await FormData.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
