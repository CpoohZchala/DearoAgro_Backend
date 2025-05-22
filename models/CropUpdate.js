const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  addDate: { type: String, required: true },
  description: { type: String, required: true },
  fertilizerType: { type: String },      // New
  fertilizerAmount: { type: Number },    // New
  fertilizerUnit: { type: String },      // New
});

const CropData = mongoose.model("CropData", cropSchema);

module.exports = CropData;
