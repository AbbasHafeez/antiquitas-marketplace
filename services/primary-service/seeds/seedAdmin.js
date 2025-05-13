// server/seeder/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log("🗄️  Connected to MongoDB");

    // Remove existing admin if present
    await User.deleteOne({ email: "admin@example.com", role: "admin" });
    console.log("🗑️  Removed any existing admin");

    // Create new admin
    const adminData = {
      name:       "admin",
      email:      "admin@example.com",
      password:   "Password123",    // will be hashed by UserSchema.pre("save")
      role:       "admin",
      isVerified: true,
      status:     "active",
    };

    const admin = await User.create(adminData);
    console.log("✅ Admin created:", admin._id);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err);
    process.exit(1);
  }
};

seedAdmin();
