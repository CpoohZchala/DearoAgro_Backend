const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    groupName: { type: String, default: null },
    profileImage: { type: String, default: "" },
    userType: { type: String, default: "Farmer" },
    branchName: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Farmer', farmerSchema);