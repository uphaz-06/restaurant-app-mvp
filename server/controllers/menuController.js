const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");

// GET /api/menu (Supports ?category= and ?search=)
const getMenuItems = async (req, res) => {
  try {
    const query = {};

    // Optional category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Optional case-insensitive search filter
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    const items = await MenuItem.find(query);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/menu/:id
const getMenuItemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid MongoDB ID format" });
    }

    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/menu
const createMenuItem = async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem); // Returns 201 for successful creation
  } catch (error) {
    // Mongoose validation errors (like missing name or negative price) trigger this
    res
      .status(400)
      .json({ message: "Invalid data provided", error: error.message });
  }
};

// PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid MongoDB ID format" });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }, // runValidators ensures negative prices are still blocked
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid data provided", error: error.message });
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid MongoDB ID format" });
    }

    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
