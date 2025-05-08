const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const general_InquirySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imagePath: { type: String },
    documentPath: { type: String },
    status: { type: String, default: "pending" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Added userId field
  },
  { timestamps: true }
);

const General_Inquiry = mongoose.model(
  "General_Inquiry",
  general_InquirySchema
);

module.exports = General_Inquiry;