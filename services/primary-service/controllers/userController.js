// server/controllers/userController.js
const asyncHandler = require("express-async-handler");
const crypto       = require("crypto");
const User         = require("../models/User");
const {
  sendPasswordResetEmail, // pre-canned OTP template from utils/mailer.js
} = require("../utils/mailer");

/* ─────────────────────────────────────────────────────── */
/*  POST /api/users/request-otp   • Private (logged-in)    */
/*  Body: { currentPassword }                              */
/*  1️⃣ Verify current password, 2️⃣ generate & e-mail OTP  */
exports.requestOtp = asyncHandler(async (req, res) => {
  const { currentPassword } = req.body;
  console.log("▶️ requestOtp body:", req.body); // debug line

  if (!currentPassword) {
    res.status(400);
    throw new Error("Current password is required");
  }

  /* ---------- find user + password hash ---------- */
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  /* ---------- verify password ---------- */
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  /* ---------- generate & store OTP ---------- */
  const otp = user.generateOtp(); // returns plain 6-digit string
  await user.save({ validateBeforeSave: false });

  /* ---------- send e-mail ---------- */
  try {
    await sendPasswordResetEmail(user, otp);
    console.log("✅ OTP e-mail sent to", user.email);
  } catch (err) {
    console.error("❌ sendEmail error:", err);
    // clean up otp fields so user can request again
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("Failed to send OTP e-mail");
  }

  res.json({ message: "OTP sent to your email" });
});

/* ─────────────────────────────────────────────────────── */
/*  PUT /api/users/change-password • Private (logged-in)   */
/*  Body: { otp, newPassword }                             */
/*  1️⃣ Validate OTP, 2️⃣ store new password               */
exports.changePassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  if (!otp || !newPassword) {
    res.status(400);
    throw new Error("Both OTP and new password are required");
  }

  /* ---------- hash incoming OTP for comparison ---------- */
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  /* ---------- find user with valid OTP ---------- */
  const user = await User.findOne({
    _id: req.user.id,
    otpCode: hashedOtp,
    otpExpire: { $gt: Date.now() },
  }).select("+otpCode +otpExpire");

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  /* ---------- update password & clear otp ---------- */
  user.password  = newPassword;           // pre-save hook hashes it
  user.otpCode   = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.json({ message: "Password changed successfully" });
});

/* ─────────────────────────────────────────────────────── */
/*  PUT /api/users/profile        • Private (logged-in)    */
/*  Body: any subset of profile fields for all roles       */
/*  e.g. name, phone, address, bankDetails, shop fields    */
/*  Returns the updated user document.                     */
exports.updateProfile = asyncHandler(async (req, res) => {
  const fields = {
    name:            req.body.name,
    phone:           req.body.phone,
    address:         req.body.address,
    bankDetails:     req.body.bankDetails,
    shopName:        req.body.shopName,
    shopDescription: req.body.shopDescription,
    shopLogo:        req.body.shopLogo,
    company:         req.body.company,
    serviceAreas:    req.body.serviceAreas,
  };

  // remove undefined keys so we don’t overwrite with empties
  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined) delete fields[key];
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: fields },
    { new: true, runValidators: true }
  );

  res.json(user);
});
