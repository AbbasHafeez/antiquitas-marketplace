// server/routes/userRoutes.js
const express = require("express");
const router  = express.Router();

const { protect } = require("../middleware/auth");
const {
  requestOtp,
  changePassword,
  updateProfile,       // ← added
} = require("../controllers/userController");

/* ────────────────────────────────
   PUBLIC ROUTES (no auth needed)
──────────────────────────────────*/
router.get("/", (req, res) => {
  res.json({ message: "Get all users route" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `Get user with ID: ${req.params.id}` });
});

/* ────────────────────────────────
   PRIVATE ROUTES (JWT required)
──────────────────────────────────*/
router.post("/request-otp",    protect, requestOtp);
router.put ("/change-password", protect, changePassword);
router.put ("/profile",         protect, updateProfile);  // ← new

module.exports = router;
