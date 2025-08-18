const express = require("express");
const router = express.Router();
const cropController = require("../controllers/cropController");

// Fetch all crops
router.get("/", cropController.getAllCrops);

// Fetch crop by ID
router.get("/:id", cropController.getCropById);

// Add a new crop
router.post("/", cropController.addCrop);

// Update a crop by ID
router.put("/:id", cropController.updateCrop);

// Delete a crop by ID
router.delete("/:id", cropController.deleteCrop);

module.exports = router;