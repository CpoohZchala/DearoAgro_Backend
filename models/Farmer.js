const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('Farmer', farmerSchema);