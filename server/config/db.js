const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect using the URI from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected"); // Log on success
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Terminate the execution if the connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
