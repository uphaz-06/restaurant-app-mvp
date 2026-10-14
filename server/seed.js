// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");
const Table = require("./models/Table");
const bcrypt = require("bcryptjs");
// Import Order and Reservation models as well

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data across all collections
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    await User.insertMany([
      {
        name: "Manager User",
        email: "manager@test.com",
        password: hashedPassword,
        role: "manager",
      },
      {
        name: "Customer User",
        email: "customer@test.com",
        password: hashedPassword,
        role: "customer",
      },
    ]);

    await Table.insertMany([
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 4 },
      // ... add at least 6 tables total
    ]);

    await MenuItem.insertMany([
      { name: "Classic Burger", price: 8.99, category: "Mains" },
      { name: "Fries", price: 3.99, category: "Sides" },
      // ... add at least 15 menu items total across diverse categories
    ]);

    console.log("Data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
