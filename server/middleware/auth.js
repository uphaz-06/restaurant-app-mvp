const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify token and fetch user
const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = authorization.slice("Bearer ".length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
    console.error("Authentication lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Manager only restriction
const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === "manager") {
    return next();
  } else {
    return res.status(403).json({ message: "Not authorized as manager" });
  }
};

module.exports = { protect, managerOnly };
