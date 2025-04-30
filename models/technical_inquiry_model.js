const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const technical_InquirySchema = new Schema(
  {
    title: {type: String,required: true,},
    description: {type: String,required: true,},
    date: {type: Date,required: true,},
    imagePath: {type: String,required: false,},
    documentPath: {type: String,required: false,},
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

const Technical_Inquiry = mongoose.model(
  "Technical_Inquiry",
  technical_InquirySchema
);

module.exports = Technical_Inquiry;
