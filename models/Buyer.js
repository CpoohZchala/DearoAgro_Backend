const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BuyerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['Buyer'], default: 'Buyer', required: true },
  profileImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Buyer', BuyerSchema);