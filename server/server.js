const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Required Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cors()); // Allows your frontend to communicate with the backend

// GET /api/health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

// Catch-all 404 handler for non-existent routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized 500 error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
