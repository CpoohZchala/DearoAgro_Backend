const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {type: String,required: true,},
  farmers: [{type: mongoose.Schema.Types.ObjectId,ref: 'Farmer',},],
},
 { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);