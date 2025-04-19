const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  memberId: {type: String,required: true},
  addDate: {type: String,required: true},
  description: {type: String,required: true},
  expense: {type: Number,required: true}, 
});

const ExpenseData = mongoose.model("ExpenseData", expenseSchema);

module.exports = ExpenseData;