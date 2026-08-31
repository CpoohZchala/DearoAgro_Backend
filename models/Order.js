const mongoose = require('mongoose');


// =========================================================
// ORDER ITEM SCHEMA
// =========================================================
const ItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    default: '',
  },

  quantity: {
    type: Number,
    required: true,
    min: 0.1,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
});


// =========================================================
// ORDER SCHEMA
// =========================================================
const OrderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: {
      type: [ItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Completed',
      ],
      default: 'Pending',
    },

    paymentMethod: {
      type: String,
      enum: [
        'Cash on Delivery',
        'Bank Transfer',
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);


// =========================================================
// CALCULATE TOTAL BEFORE SAVE
// =========================================================
OrderSchema.pre(
  'save',
  function (next) {
    this.totalAmount = parseFloat(
      this.items
        .reduce(
          (sum, item) =>
            sum +
            item.price *
                item.quantity,
          0,
        )
        .toFixed(2),
    );

    next();
  },
);


// =========================================================
// UPDATE STATUS
// =========================================================
OrderSchema.methods.updateStatus =
    async function (newStatus) {
  this.status = newStatus;

  await this.save();

  return this;
};


const Order =
    mongoose.model(
  'Order',
  OrderSchema,
);

module.exports = Order;