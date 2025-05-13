// server/controllers/authController.js
const asyncHandler = require("express-async-handler");
const crypto       = require("crypto");

const User          = require("../models/User");
const generateToken = require("../utils/generateToken");

const {
  sendWelcomeEmail,
  sendPasswordResetEmail,  // ⬅️ will reuse to send OTP
} = require("../utils/mailer");

/* ─────────────────────────────────────────────────────── */
/* 📍 Google Register                                      */
const googleRegister = asyncHandler(async (req, res) => {
  const { name, email, picture, role } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password : "google-oauth",
      role     : role || "buyer",
      avatar   : picture,
      isVerified: true,
    });
  }

  res.status(201).json({
    _id  : user._id,
    name : user.name,
    email: user.email,
    role : user.role,
    token: generateToken(user._id),
  });
});

/* ─────────────────────────────────────────────────────── */
/* 📍 Google Login                                         */
const googleLogin = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "No account associated with this email. Please register first." });
  }

  res.json({
    _id   : user._id,
    name  : user.name,
    email : user.email,
    role  : user.role,
    avatar: user.avatar,
    token : generateToken(user._id),
  });
});

/* ─────────────────────────────────────────────────────── */
/* Register User                                           */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "buyer",
  });

  /* email‑verification token */
  user.verificationToken = crypto.randomBytes(20).toString("hex");
  await user.save();

  const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify/${user.verificationToken}`;

  /* Send welcome / verification email (non‑blocking) */
  try {
    await sendWelcomeEmail(user, verificationUrl);
  } catch (err) {
    console.error("📧 Welcome mail error:", err);
  }

  res.status(201).json({
    _id  : user._id,
    name : user.name,
    email: user.email,
    role : user.role,
    token: user.getSignedJwtToken(),
  });
});

/* ─────────────────────────────────────────────────────── */
/* Login User                                              */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json({
    _id  : user._id,
    name : user.name,
    email: user.email,
    role : user.role,
    token: user.getSignedJwtToken(),
  });
});

/* ─────────────────────────────────────────────────────── */
/* Get Current User                                        */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    _id  : user._id,
    name : user.name,
    email: user.email,
    role : user.role,
    phone   : user.phone,
    address : user.address,
    avatar  : user.avatar,
    isVerified: user.isVerified,
    createdAt : user.createdAt,
    shopName        : user.shopName,
    shopDescription : user.shopDescription,
    shopLogo        : user.shopLogo,
    company         : user.company,
    serviceAreas    : user.serviceAreas,
  });
});

/* ─────────────────────────────────────────────────────── */
/* Forgot Password  ➜  sends 6‑digit OTP                   */
/* Route: POST /api/auth/forgot-password                   */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("There is no user with that email");
  }

  // generate & store OTP
  const otp = user.generateOtp();
  await user.save({ validateBeforeSave: false });

  try {
    // reuse helper (subject/body adapted inside helper)
    await sendPasswordResetEmail(user, otp);
    res.json({ success: true, data: "OTP sent to email" });
  } catch (err) {
    console.error("Password reset mail error:", err);
    user.otpCode   = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

/* ─────────────────────────────────────────────────────── */
/* Reset Password  ➜  verifies OTP                         */
/* Route: PUT /api/auth/reset-password                     */
/* Body: { email, otp, password }                          */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  // hash incoming OTP
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    otpCode:   hashedOtp,
    otpExpire: { $gt: Date.now() },
  }).select("+otpCode +otpExpire");

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password  = password;
  user.otpCode   = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.json({
    _id  : user._id,
    name : user.name,
    email: user.email,
    role : user.role,
    token: user.getSignedJwtToken(),
  });
});

/* ─────────────────────────────────────────────────────── */
/* Verify Email                                            */
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.verificationtoken });
  if (!user) {
    res.status(400);
    throw new Error("Invalid verification token");
  }

  user.isVerified        = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
});

/* ─────────────────────────────────────────────────────── */
module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleRegister,
  googleLogin,
};
