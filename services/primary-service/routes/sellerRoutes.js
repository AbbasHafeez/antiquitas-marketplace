const express = require("express");
const { protect, authRole } = require("../middleware/auth");

/* 1️⃣  dash-card statistics & top-products */
const {
  getStats,
  getTopProducts,
} = require("../controllers/sellerController");

/* 2️⃣  earnings overview (chart & cards) */
const {
  getSellerEarnings,
} = require("../controllers/earningController");      // ← see previous message

/* 3️⃣  recent payout / transaction list    */
const {
  getSellerTransactions,
} = require("../controllers/transactionController");  // ← create if you need it

const router = express.Router();

/* every route below requires a logged-in user with role === "seller" */
router.use(protect, authRole("seller"));

/* ───────── dashboard cards ───────── */
router.get("/stats",         getStats);
router.get("/top-products",  getTopProducts);

/* ───────── earnings page ─────────── */
router.get("/earnings",      getSellerEarnings);      // ?timeframe=week|month|year
router.get("/transactions",  getSellerTransactions);  // optional: limit / page

module.exports = router;      // ← DO NOT FORGET
