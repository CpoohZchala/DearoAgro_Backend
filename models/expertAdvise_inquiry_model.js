const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expert_InquirySchema = new Schema(
  {
    title: {type: String,required: true,},
    description: {type: String,required: true,},
    date: {type: Date,required: true,},
    imagePath: {type: String,required: false,},
    documentPath: {type: String,required: false,},},
  { timestamps: true }
);

const Expert_Inquiry = mongoose.model(
  "Expert_Inquiry",
  expert_InquirySchema
);

module.exports = Expert_Inquiry;
