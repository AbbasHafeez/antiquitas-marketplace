// server/routes/authRoutes.js
const express = require("express");
const router  = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,   // ▶ sends 6‑digit OTP
  resetPassword,    // ▶ validates OTP + sets new pw
  verifyEmail,
  googleRegister,
  googleLogin,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

/* ─────────────────────────────────────────────────────── */
/* 🛡️  Core auth routes                                    */
router.post("/register",       register);
router.post("/login",          login);
router.get  ("/me",            protect, getMe);

/* ──────── OTP‑based password recovery ──────── */
router.post("/forgot-password", forgotPassword);
router.put ("/reset-password",  resetPassword);

/* ──────── Email verification (unchanged) ───── */
router.get("/verify/:verificationtoken", verifyEmail);

/* ─────────────────────────────────────────────────────── */
/* 🔵  Google OAuth routes                                 */
router.post("/google-register", googleRegister);
router.post("/google-login",    googleLogin);

module.exports = router;
