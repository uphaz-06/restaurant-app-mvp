const express = require("express");
const { protect, managerOnly } = require("../middleware/auth");
const {
  getTables,
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
} = require("../controllers/reservationController");

const router = express.Router();

router.get("/tables", getTables);
router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);
router.get("/", protect, managerOnly, getAllReservations);
router.patch("/:id/cancel", protect, cancelReservation);
router.patch("/:id", protect, managerOnly, updateReservationStatus);

module.exports = router;
