const mongoose = require("mongoose");

// Sub-schema for individual items inside an order
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Each Order stores the id of the user who placed it[cite: 1]
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      // Order status can only be Pending, Preparing, Ready, Served, or Cancelled[cite: 1]
      enum: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
); // createdAt and updatedAt are saved automatically[cite: 1]

module.exports = mongoose.model("Order", orderSchema);
