// server/controllers/transactionController.js

const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order");

/**
 * GET /api/seller/transactions?limit=10
 * Returns a list of the seller’s most recent delivered orders as “transactions”
 * Query:
 *   • limit (optional, default 10)
 * Response:
 *   [ { orderId, deliveredAt, amount }, … ]
 */
exports.getSellerTransactions = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const limit    = Math.max(1, parseInt(req.query.limit, 10) || 10);

  // Find delivered orders for this seller, most recent first
  const orders = await Order.find({
    seller: sellerId,
    status: "delivered",
  })
    .sort({ deliveredAt: -1 })
    .limit(limit)
    .select("_id deliveredAt totalPrice")
    .lean();

  // Map to a simple transaction format
  const transactions = orders.map((o) => ({
    orderId:     o._id,
    deliveredAt: o.deliveredAt,
    amount:      o.totalPrice,
  }));

  res.json(transactions);
});
