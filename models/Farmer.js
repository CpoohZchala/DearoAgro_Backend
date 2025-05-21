const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    groupName: { type: String, default: null },
    profileImage: { type: String, default: "" },
    userType: { type: String, enum: ['Super Admin', 'Farmer', 'Marketing Officer'], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Farmer', farmerSchema);