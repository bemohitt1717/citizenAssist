import jwt from "jsonwebtoken";

import User from "../model/user.js";

/**
 * Production-ready authentication middleware with cookie and Bearer token support
 * Supports both HTTP-only cookies (preferred) and Authorization header (for API clients)
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Priority 1: Check HTTP-only cookie (preferred for web apps)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    // Priority 2: Check Authorization header (for API clients/mobile apps)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User no longer exists.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        status: "error",
        message: "This account is currently unavailable.",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Session expired. Please sign in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token.",
        code: "INVALID_TOKEN",
      });
    }

    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};