const express = require('express');
const router = express.Router();
const SoilTestReport = require('./models/soil_test_report');

// Create a new soil test report
router.post('/soil-test', async (req, res) => {
  try {
    const report = new SoilTestReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all reports for a specific farmer
router.get('/soil-test/farmer/:farmerId', async (req, res) => {
  try {
    const reports = await SoilTestReport.find({ farmerId: req.params.farmerId });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single report by ID
router.get('/soil-test/:id', async (req, res) => {
  try {
    const report = await SoilTestReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a report
router.put('/soil-test/:id', async (req, res) => {
  try {
    const report = await SoilTestReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a report
router.delete('/soil-test/:id', async (req, res) => {
  try {
    const report = await SoilTestReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
