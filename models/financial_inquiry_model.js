const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const financial_InquirySchema = new Schema(
  {
    title: {type: String,required: true,},
    description: {type: String,required: true,},
    date: {type: Date,required: true,},
    imagePath: {type: String,required: false,},
    documentPath: {type: String,required: false,},},
  { timestamps: true }
);

const Financial_Inquiry = mongoose.model(
  "Financial_Inquiry",
  financial_InquirySchema
);

module.exports = Financial_Inquiry;
