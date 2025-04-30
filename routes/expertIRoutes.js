const express = require("express");
const router = express.Router();
const Expert_Inquiry = require("../models/expertAdvice_inquiry_model");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads_expertAdvice';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).fields([
  { name: 'imagePath', maxCount: 1 },
  { name: 'documentPath', maxCount: 1 }
]);

// Create a new inquiry with file uploads
router.post("/einquiry", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ 
        message: "File upload failed",
        error: err.message 
      });
    }

    try {
      const { title, description, date } = req.body;
      
      // Get file paths if files were uploaded
      const imagePath = req.files['imagePath'] ? 
        '/uploads_expertAdvice/' + req.files['imagePath'][0].filename : null;
      const documentPath = req.files['documentPath'] ? 
        '/uploads_expertAdvice/' + req.files['documentPath'][0].filename : null;

      console.log('Creating inquiry with:', {
        title, description, date, imagePath, documentPath
      });

      const newInquiry = new General_Inquiry({
        title,
        description,
        date,
        imagePath,
        documentPath,
      });

      const savedInquiry = await newInquiry.save();
      res.status(201).json(savedInquiry);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ 
        message: "Error creating inquiry",
        error: err.message 
      });
    }
  });
});


// Get all inquiries
router.get("/einquiries", async (req, res) => {
  try {
    const inquiries = await General_Inquiry.find();
    res.status(200).json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching inquiries" });
  }
});

// Get a single inquiry by ID
router.get("/einquiry/:id", async (req, res) => {
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
router.put("/einquiry/:id", async (req, res) => {
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
router.delete("/einquiry/:id", async (req, res) => {
  try {
    const deletedInquiry = await General_Inquiry.findByIdAndDelete(req.params.id);
    if (!deletedInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting inquiry" });
  }
});

module.exports = router;