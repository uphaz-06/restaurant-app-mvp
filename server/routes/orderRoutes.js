const express = require("express");
const { protect, managerOnly } = require("../middleware/auth");
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, managerOnly, getAllOrders);
router.patch("/:id/status", protect, managerOnly, updateOrderStatus);

module.exports = router;
