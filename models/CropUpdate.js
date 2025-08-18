const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  memberId: { type: String},
  addDate: { type: String, required: true },
  description: { type: String, required: true },
  fertilizerType: { type: String },      
  fertilizerAmount: { type: Number },    
  fertilizerUnit: { type: String },     
});

const CropData = mongoose.model("CropData", cropSchema);

module.exports = CropData;
