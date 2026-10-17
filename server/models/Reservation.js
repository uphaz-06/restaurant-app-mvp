const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      match: /^03\d{2}-?\d{7}$/,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Declined", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

reservationSchema.index(
  { table: 1, reservationDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["Pending", "Confirmed"] } },
  },
);

module.exports = mongoose.model("Reservation", reservationSchema);
