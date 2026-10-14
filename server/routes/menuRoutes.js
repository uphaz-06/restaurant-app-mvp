const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

// Import the security middleware
const { protect, managerOnly } = require("../middleware/auth");

router
  .route("/")
  .get(getMenuItems) // Public access (anyone can view)
  .post(protect, managerOnly, createMenuItem); // Protected (only managers can add)

router
  .route("/:id")
  .get(getMenuItemById) // Public access
  .put(protect, managerOnly, updateMenuItem) // Protected (only managers can edit)
  .delete(protect, managerOnly, deleteMenuItem); // Protected (only managers can delete)

module.exports = router;
