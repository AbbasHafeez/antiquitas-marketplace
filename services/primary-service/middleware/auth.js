const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// ── Protect: any logged-in user ──────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (err) {
      console.error("Token verification failed:", err);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  res.status(401);
  throw new Error("Not authorized, no token");
});

// ── authRole: allow one or more roles (case-insensitive) ───────────
const authRole = (...roles) =>
  asyncHandler((req, res, next) => {
    if (!req.user) {
      res.status(403);
      throw new Error("Not authorized for this resource");
    }
    const userRole = String(req.user.role).toLowerCase();
    const allowed  = roles.map((r) => String(r).toLowerCase());
    if (allowed.includes(userRole)) {
      return next();
    }
    res.status(403);
    throw new Error("Not authorized for this resource");
  });

// ── Convenience single-role shortcuts ─────────────────────────────
const admin   = authRole("admin");
const seller  = authRole("seller");
const shipper = authRole("shipper");

module.exports = { protect, authRole, admin, seller, shipper };
