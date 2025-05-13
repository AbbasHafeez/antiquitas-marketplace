require("dotenv").config();             // so MONGO_URI works
const mongoose = require("mongoose");
const Category = require("../models/Category");

// ── 1. connect ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// ── 2. sample data ───────────────────────────────────────────
const sampleCategories = [
  {
    name: "Furniture",
    description: "Antique chairs, tables, cupboards, and more.",
  },
  {
    name: "Coins",
    description: "Historical coins, medals, and currency notes.",
  },
  {
    name: "Jewellery",
    description: "Vintage rings, necklaces, and brooches.",
  },
  {
    name: "Art",
    description: "Paintings, sculptures, and collectible art pieces.",
  },
];

// ── 3. seed function ─────────────────────────────────────────
const seed = async () => {
  try {
    await Category.deleteMany();                 // wipe existing
    await Category.insertMany(sampleCategories); // insert fresh
    console.log("✅ Categories seeded!");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};

seed();
