const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String ,default: ""}, 
    userType: { type: String, required: true }  ,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
