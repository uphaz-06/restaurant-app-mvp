require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");
const Table = require("./models/Table");
const Reservation = require("./models/Reservation");
const Order = require("./models/Order");

const menuItems = [
  { name: "Tomato Soup", description: "Slow-roasted tomato soup with herbs", price: 5.5, category: "Starters" },
  { name: "Garden Salad", description: "Seasonal greens, cucumber, and house dressing", price: 6.25, category: "Starters" },
  { name: "Garlic Bread", description: "Toasted sourdough with garlic butter", price: 4.5, category: "Starters" },
  { name: "Classic Burger", description: "Beef patty, cheddar, lettuce, and tomato", price: 12.95, category: "Mains", isSpecial: true },
  { name: "Grilled Chicken", description: "Herb-marinated chicken with vegetables", price: 14.5, category: "Mains" },
  { name: "Margherita Pizza", description: "Tomato, mozzarella, and fresh basil", price: 13, category: "Mains" },
  { name: "Creamy Alfredo Pasta", description: "Fettuccine in a creamy parmesan sauce", price: 12.5, category: "Mains" },
  { name: "Vegetable Stir Fry", description: "Seasonal vegetables with steamed rice", price: 11.75, category: "Mains" },
  { name: "Fish and Chips", description: "Crispy fish with golden fries", price: 15.25, category: "Mains" },
  { name: "French Fries", description: "Crispy seasoned potato fries", price: 4.25, category: "Sides" },
  { name: "Onion Rings", description: "Golden battered onion rings", price: 4.75, category: "Sides" },
  { name: "Chocolate Cake", description: "Rich chocolate layer cake", price: 6.5, category: "Desserts" },
  { name: "Cheesecake", description: "Classic vanilla cheesecake with berry sauce", price: 6.75, category: "Desserts" },
  { name: "Lemonade", description: "Freshly squeezed lemonade", price: 3.5, category: "Drinks" },
  { name: "Iced Tea", description: "House-brewed black tea served chilled", price: 3.25, category: "Drinks" },
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be set before running the seed script");
    }
    await mongoose.connect(process.env.MONGO_URI);

    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Reservation.deleteMany({}),
      Order.deleteMany({}),
    ]);

    const password = await bcrypt.hash("password123", 10);
    await User.insertMany([
      {
        name: "Restaurant Manager",
        email: "manager@test.com",
        password,
        role: "manager",
      },
      {
        name: "Sample Customer",
        email: "customer@test.com",
        password,
        role: "customer",
      },
    ]);
    await MenuItem.insertMany(menuItems);
    await Table.insertMany([
      { tableNumber: 1, capacity: 2, location: "Window" },
      { tableNumber: 2, capacity: 2, location: "Window" },
      { tableNumber: 3, capacity: 4, location: "Main dining room" },
      { tableNumber: 4, capacity: 4, location: "Main dining room" },
      { tableNumber: 5, capacity: 6, location: "Patio" },
      { tableNumber: 6, capacity: 8, location: "Private room" },
    ]);

    console.log("Seeded 2 users, 15 menu items, and 6 tables.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
