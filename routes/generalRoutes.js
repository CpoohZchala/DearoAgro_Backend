const express = require("express");
const router = express.Router();
const General_Inquiry = require("../models/general_inquiry_model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).fields([
  { name: "imagePath", maxCount: 1 },
  { name: "documentPath", maxCount: 1 },
]);

router.post("/inquiry", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({
        message: "File upload failed",
        error: err.message,
      });
    }

    try {
      const { title, description, date, userId } = req.body; // Include userId in the request body

      // Get file paths if files were uploaded
      const imagePath = req.files["imagePath"]
        ? path.join("uploads", req.files["imagePath"][0].filename)
        : null;
      const documentPath = req.files["documentPath"]
        ? path.join("uploads", req.files["documentPath"][0].filename)
        : null;

      const newInquiry = new General_Inquiry({
        title,
        description,
        date: new Date(date),
        imagePath,
        documentPath,
        status: "pending",
        userId,
      });

      const savedInquiry = await newInquiry.save();
      res.status(201).json(savedInquiry);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({
        message: "Error creating inquiry",
        error: err.message,
      });
    }
  });
});

// Get all inquiries
router.get("/inquiries", async (req, res) => {
  try {
    const inquiries = await General_Inquiry.find();
    res.status(200).json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching inquiries" });
  }
});

// Get a single inquiry by ID
router.get("/inquiry/:id", async (req, res) => {
  try {
    const inquiry = await General_Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.status(200).json(inquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching inquiry" });
  }
});

// Update an inquiry by ID
router.put("/inquiry/:id", async (req, res) => {
  try {
    const { title, description, date, imagePath, documentPath } = req.body;
    const updatedInquiry = await General_Inquiry.findByIdAndUpdate(
      req.params.id,
      { title, description, date, imagePath, documentPath },
      { new: true }
    );

    if (!updatedInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json(updatedInquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating inquiry" });
  }
});

// Delete an inquiry by ID
router.delete("/inquiry/:id", async (req, res) => {
  try {
    const deletedInquiry = await General_Inquiry.findByIdAndDelete(
      req.params.id
    );
    if (!deletedInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting inquiry" });
  }
});

// Get inquiries by user ID
router.get("/inquiries/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const inquiries = await General_Inquiry.find({ userId });
    if (!inquiries || inquiries.length === 0) {
      return res.status(404).json({ message: "No inquiries found for this user" });
    }

    res.status(200).json(inquiries);
  } catch (err) {
    console.error("Error fetching inquiries by user ID:", err);
    res.status(500).json({ message: "Error fetching inquiries", error: err.message });
  }
});

module.exports = router;
