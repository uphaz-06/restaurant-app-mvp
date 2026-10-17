const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");

const validId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const parseDateOnly = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const todayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return res.status(200).json(tables);
  } catch (error) {
    console.error("Could not fetch tables:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createReservation = async (req, res) => {
  try {
    const { table, reservationDate, timeSlot, partySize, phone } = req.body || {};
    const tableId = String(table || "");
    if (
      !validId(tableId) ||
      typeof timeSlot !== "string" ||
      !Number.isInteger(partySize) ||
      partySize < 1 ||
      partySize > 12
    ) {
      return res.status(400).json({
        message: "A valid table, date, time slot, and party size (1-12) are required",
      });
    }
    if (!/^([01]\d|2[0-2]):00$/.test(timeSlot)) {
      return res.status(400).json({ message: "Choose an hourly slot between 12:00 and 22:00" });
    }
    if (phone && !/^03\d{2}-?\d{7}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must use the format 03XX-XXXXXXX" });
    }

    const date = parseDateOnly(reservationDate);
    if (!date || reservationDate < todayDateString()) {
      return res.status(400).json({ message: "Reservation date must be today or a future date" });
    }

    const selectedTable = await Table.findById(tableId);
    if (!selectedTable) {
      return res.status(404).json({ message: "Table not found" });
    }
    if (partySize > selectedTable.capacity) {
      return res.status(400).json({ message: "Party size exceeds this table's capacity" });
    }

    const existingReservation = await Reservation.findOne({
      table: tableId,
      reservationDate: date,
      timeSlot,
      status: { $in: ["Pending", "Confirmed"] },
    });
    if (existingReservation) {
      return res.status(409).json({ message: "This table is already booked for that date and time" });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      reservationDate: date,
      timeSlot,
      partySize,
      phone: phone || undefined,
    });
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("table")
      .populate("user", "name email");
    return res.status(201).json(populatedReservation);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This table is already booked for that date and time" });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not create reservation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ reservationDate: -1, timeSlot: 1 })
      .populate("table")
      .populate("user", "name email");
    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Could not fetch customer reservations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ reservationDate: 1, timeSlot: 1 })
      .populate("table")
      .populate("user", "name email");
    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Could not fetch reservations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid reservation id" });
    }
    const { status } = req.body || {};
    if (!["Confirmed", "Declined"].includes(status)) {
      return res.status(400).json({ message: "Status must be Confirmed or Declined" });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    if (reservation.status !== "Pending") {
      return res.status(400).json({ message: "Only pending reservations can be reviewed" });
    }

    reservation.status = status;
    await reservation.save();
    await reservation.populate("table");
    await reservation.populate("user", "name email");
    return res.status(200).json(reservation);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not update reservation status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const cancelReservation = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid reservation id" });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    if (String(reservation.user) !== String(req.user._id) && req.user.role !== "manager") {
      return res.status(403).json({ message: "You can only cancel your own reservation" });
    }
    if (reservation.status !== "Pending") {
      return res.status(400).json({ message: "Only pending reservations can be cancelled" });
    }

    reservation.status = "Cancelled";
    await reservation.save();
    await reservation.populate("table");
    await reservation.populate("user", "name email");
    return res.status(200).json(reservation);
  } catch (error) {
    console.error("Could not cancel reservation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTables,
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
};
