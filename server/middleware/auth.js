const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify token and fetch user
const protect = async (req, res, next) => {
  let token;

  // Check if header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to req.user (excluding password)[cite: 1]
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Manager only restriction
const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === "manager") {
    next();
  } else {
    // Return 403 if role is not manager[cite: 1]
    res.status(403).json({ message: "Not authorized as manager" });
  }
};

module.exports = { protect, managerOnly };
