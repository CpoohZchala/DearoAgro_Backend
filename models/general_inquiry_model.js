const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const general_InquirySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imagePath: { type: String },
    documentPath: { type: String },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

const General_Inquiry = mongoose.model(
  "General_Inquiry",
  general_InquirySchema
);

module.exports = General_Inquiry;