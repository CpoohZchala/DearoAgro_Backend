// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {type: String,required: true},
  mobileNumber: {type: String,required: true,unique: true},
  password: {type: String,required: true},
  userType: {type: String,enum: ['Super Admin', 'Farmer', 'Marketing Officer'],required: true},
  group: {type: mongoose.Schema.Types.ObjectId,ref: 'Group'},
  createdAt: {type: Date,default: Date.now}
});



module.exports = mongoose.model('User', UserSchema);