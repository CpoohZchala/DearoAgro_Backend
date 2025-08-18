const mongoose = require('mongoose');

const marketingOfficerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Marketing Officer'], default: 'Marketing Officer', required: true },
    profileImage: { type: String, default: "" },
    branchName: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketingOfficer', marketingOfficerSchema);