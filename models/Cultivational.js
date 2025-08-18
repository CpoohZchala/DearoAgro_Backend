const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  cropCategory: { type: String, required: true },
  cropName: { type: String, required: true },
  address: { type: String, required: true },
  startDate: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  nic: { type: String, required: true },
  cropYieldSize: { type: Number, required: true },
});

const FormData = mongoose.model("FormData", formSchema);

module.exports = FormData;
