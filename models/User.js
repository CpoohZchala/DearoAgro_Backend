// To create user models const mongoose = require('mongoose');

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },  // userType validation
  });
  

module.exports = mongoose.model("User", UserSchema);
