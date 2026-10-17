const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  location: {
    type: String,
    default: "Main dining room",
  },
});

module.exports = mongoose.model("Table", tableSchema);
