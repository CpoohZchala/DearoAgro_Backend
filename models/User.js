// To create user models const mongoose = require('mongoose');

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Farmer', 'Marketing Officer', 'Super Admin'], required: true }
});

module.exports = mongoose.model('User', UserSchema);
