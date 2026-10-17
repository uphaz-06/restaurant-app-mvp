const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");

// GET /api/menu (Supports ?category= and ?search=)
const getMenuItems = async (req, res) => {
  try {
    const query = {};

    if (typeof req.query.category === "string" && req.query.category.trim()) {
      query.category = req.query.category.trim();
    }

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const escapedSearch = req.query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.name = { $regex: escapedSearch, $options: "i" };
    }

    const items = await MenuItem.find(query);
    return res.status(200).json(items);
  } catch (error) {
    console.error("Could not fetch menu:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/menu/:id
const getMenuItemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Could not fetch menu item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/menu
const createMenuItem = async (req, res) => {
  try {
    const newItem = new MenuItem(req.body || {});
    const savedItem = await newItem.save();
    return res.status(201).json(savedItem);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not create menu item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid menu item id" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Update body is required" });
    }
    if (
      ["__proto__", "prototype", "constructor"].some((key) =>
        req.body.hasOwnProperty(key),
      )
    ) {
      return res.status(400).json({ message: "Invalid update fields" });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json(updatedItem);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not update menu item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid menu item id" });
    }

    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Could not delete menu item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
