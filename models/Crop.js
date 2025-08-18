const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "ධාන්‍ය බෝග",
      "මුලබෝග",
      "පලතුරු බෝග",
      "එළවළු බෝග",
      "පාන බෝග",
      "ඖෂධීය සහ සුගන්ධ බෝග",
    ],
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Crop", cropSchema);