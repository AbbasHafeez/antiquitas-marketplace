// server/seeder/seedShipper.js
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../models/User");

const seedShipper = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log("🗄️  Connected to MongoDB");

    // Remove existing TCS Express shipper if present
    await User.deleteOne({ email: "tcs@example.com", role: "shipper" });
    console.log("🗑️  Removed any existing TCS shipper");

    // Create new shipper
    const shipperData = {
      name:         "TCS Express",
      email:        "tcs@example.com",
      password:     "Password123",    // will be hashed by UserSchema.pre("save")
      role:         "shipper",
      phone:        "1234567890",
      company:      "TCS Express Ltd.",
      serviceAreas: ["New York", "Los Angeles", "Chicago"],
      isVerified:   true,
      status:       "active",
    };

    const shipper = await User.create(shipperData);
    console.log("✅ Shipper created:", shipper._id);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err);
    process.exit(1);
  }
};

seedShipper();
