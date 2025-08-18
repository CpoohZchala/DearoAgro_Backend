const Crop = require("../models/Crop");

// Fetch all crops
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find();
    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: "Error fetching crops" });
  }
};

// Fetch crop by ID
exports.getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.status(200).json(crop);
  } catch (error) {
    res.status(500).json({ message: "Error fetching crop by ID" });
  }
};

// Add a new crop
exports.addCrop = async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;

    // Validate input
    if (!name || !category || !imageUrl) {
      return res.status(400).json({ message: "Name, category, and image URL are required" });
    }

    // Create a new crop
    const crop = new Crop({ name, category, imageUrl });
    await crop.save();

    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: "Error adding crop" });
  }
};

// Update a crop by ID
exports.updateCrop = async (req, res) => {
  const { name, category, imageUrl } = req.body;
  const cropId = req.params.id;

  if (!cropId) {
    return res.status(400).json({ message: "Crop ID is required" });
  }

  try {
    const updatedCrop = await Crop.findByIdAndUpdate(
      cropId,
      { name, category, imageUrl },
      { new: true }
    );

    if (!updatedCrop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.status(200).json(updatedCrop);
  } catch (error) {
    console.error("Error updating crop:", error);
    res.status(500).json({ message: "Error updating crop", error: error.message });
  }
};

// Delete a crop by ID
exports.deleteCrop = async (req, res) => {
  const cropId = req.params.id;

  if (!cropId) {
    return res.status(400).json({ message: "Crop ID is required" });
  }

  try {
    const deletedCrop = await Crop.findByIdAndDelete(cropId);
    if (!deletedCrop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    console.error("Error deleting crop:", error);
    res.status(500).json({ message: "Error deleting crop", error: error.message });
  }
};