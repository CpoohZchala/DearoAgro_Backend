const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    harvestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Harvest', required: true },
     stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true }
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;