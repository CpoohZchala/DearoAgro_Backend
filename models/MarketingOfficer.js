const mongoose = require('mongoose');

const marketingOfficerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketingOfficer', marketingOfficerSchema);