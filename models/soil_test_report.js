const mongoose = require('mongoose');

const SoilTestReportSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  ph: { type: String, required: true },
  nitrogen: { type: String, required: true },
  phosphorus: { type: String, required: true },
  potassium: { type: String, required: true },
  micronutrients: { type: String, required: true },
  soilTexture: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilTestReport', SoilTestReportSchema);