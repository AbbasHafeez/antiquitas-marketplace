// server/routes/transactionRoutes.js
const express       = require("express");
const asyncHandler  = require("express-async-handler");
const Transaction   = require("../models/Transaction");
const { protect, authRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/transactions
// returns the last N transactions for the logged–in seller
router.get(
  "/",
  protect,
  authRole("seller"),
  asyncHandler(async (req, res) => {
    // parse page & limit, with defaults
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    // run both query + count in parallel
    const [txns, total] = await Promise.all([
      Transaction.find({ seller: req.user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ seller: req.user._id })
    ]);

    const pages = Math.ceil(total / limit);
   res.json({ txns, page, pages });
   })
 );

module.exports = router;
