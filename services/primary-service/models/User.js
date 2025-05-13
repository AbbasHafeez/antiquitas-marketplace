const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");

/* ───────────────────────────────────────────────────── */
/* User Schema                                           */
/* ───────────────────────────────────────────────────── */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["buyer", "seller", "admin", "shipper"],
    default: "buyer",
  },
  phone: {
    type: String,
    match: [/^[0-9]{10,15}$/, "Please add a valid phone number"],
  },
  address: {
    street: String,
    city:   String,
    state:  String,
    postalCode: String,
    country: String,
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/demo/image/upload/v1580125958/samples/people/default-avatar.jpg",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "suspended", "unverified"],
    default: "active",
  },
  verificationToken:  String,

  /* ─────── password‑reset via email link ─────── */
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  /* ─────── NEW: OTP‑based password flows ─────── */
  otpCode:   { type: String, select: false },
  otpExpire: { type: Date,   select: false },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  /* ---------- Seller‑specific ---------- */
  shopName:        String,
  shopDescription: String,
  shopLogo:        String,
  bankDetails: {
    accountName:   String,
    accountNumber: String,
    bankName:      String,
    swiftCode:     String,
  },

  /* ---------- Shipper‑specific ---------- */
  company:      String,
  serviceAreas: [String],
});

/* ───────────────────────────────────────────────────── */
/* Pre‑save hook – hash password if modified            */
/* ───────────────────────────────────────────────────── */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt   = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ───────────────────────────────────────────────────── */
/* Instance methods                                     */
/* ───────────────────────────────────────────────────── */

/* Sign JWT and return */
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/* Match raw password to hashed */
UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/* Generate and hash reset‑password token (email link flow) */
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

/* NEW: Generate and store a 6‑digit OTP (returns the plain OTP) */
UserSchema.methods.generateOtp = function () {
  const otp = (Math.floor(Math.random() * 900000) + 100000).toString(); // 6 digits

  this.otpCode = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 min
  return otp;
};

module.exports = mongoose.model("User", UserSchema);
