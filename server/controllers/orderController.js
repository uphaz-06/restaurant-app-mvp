const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

const validId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const placeOrder = async (req, res) => {
  try {
    const { items, type = "Takeaway" } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }
    if (!["Dine-in", "Takeaway"].includes(type)) {
      return res.status(400).json({ message: "Order type must be Dine-in or Takeaway" });
    }

    const quantities = new Map();
    const notes = new Map();
    for (const item of items) {
      const menuItemId = item ? String(item.menuItem) : "";
      if (
        !validId(menuItemId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return res.status(400).json({
          message: "Each item needs a valid menuItem id and quantity from 1 to 99",
        });
      }
      quantities.set(menuItemId, (quantities.get(menuItemId) || 0) + item.quantity);
      if (typeof item.note === "string" && item.note.trim()) {
        notes.set(menuItemId, item.note.trim().slice(0, 300));
      }
    }

    const menuItems = await MenuItem.find({ _id: { $in: [...quantities.keys()] } });
    if (menuItems.length !== quantities.size) {
      return res.status(400).json({ message: "One or more menu items no longer exist" });
    }
    if (menuItems.some((item) => !item.isAvailable)) {
      return res.status(400).json({ message: "One or more items are unavailable" });
    }

    // The server uses current database prices so clients cannot submit stale or manipulated totals.
    const orderItems = menuItems.map((item) => ({
      menuItem: item._id,
      quantity: quantities.get(item._id.toString()),
      price: item.price,
      note: notes.get(item._id.toString()),
    }));
    const totalAmount =
      Math.round(
        orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
      ) / 100;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      type,
    });
    const populatedOrder = await Order.findById(order._id)
      .populate("items.menuItem", "name")
      .populate("user", "name email");
    return res.status(201).json(populatedOrder);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not place order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.menuItem", "name");
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Could not fetch customer orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.menuItem", "name");
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Could not fetch orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    const { status } = req.body || {};
    const allowedStatuses = ["Pending", "Preparing", "Ready", "Served", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const nextStatus = {
      Pending: "Preparing",
      Preparing: "Ready",
      Ready: "Served",
      Served: null,
      Cancelled: null,
    };
    const isCancellation = status === "Cancelled" && order.status === "Pending";
    if (!isCancellation && nextStatus[order.status] !== status) {
      return res.status(400).json({
        message: "Order status must move forward one step; only Pending orders can be cancelled",
      });
    }

    order.status = status;
    await order.save();
    await order.populate("user", "name email");
    await order.populate("items.menuItem", "name");
    return res.status(200).json(order);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not update order status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
