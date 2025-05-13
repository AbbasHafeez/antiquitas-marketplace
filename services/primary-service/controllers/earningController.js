// server/controllers/earningController.js

const mongoose    = require("mongoose");
const Transaction = require("../models/Transaction");

/**
 * Build a MongoDB date‐range filter
 */
function rangeMatch(timeframe) {
  const now   = new Date();
  const start = new Date(now);

  switch (timeframe) {
    case "week":
      start.setDate(now.getDate() - 6);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }
  start.setHours(0,0,0,0);
  return { $gte: start, $lte: now };
}

/**
 * GET /api/seller/earnings
 */
exports.getSellerEarnings = async (req, res) => {
  try {
    // 1) Auth guard
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const sellerId   = req.user._id;
    const timeframe  = req.query.timeframe || "month";
    const dateFilter = rangeMatch(timeframe);

    // 2) Aggregate totals by status
    const stats = await Transaction.aggregate([
      {
        $match: {
          seller:      new mongoose.Types.ObjectId(sellerId),
          createdAt:   dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: "$amount"
          },
          pendingPayouts: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending"] },
                "$amount",
                0
              ]
            }
          },
          completedPayouts: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                "$amount",
                0
              ]
            }
          },
        }
      }
    ]);

    const {
      totalEarnings   = 0,
      pendingPayouts  = 0,
      completedPayouts = 0
    } = stats[0] || {};

    // 3) Build daily time-series
    const daily = await Transaction.aggregate([
      {
        $match: {
          seller:    new mongoose.Types.ObjectId(sellerId),
          createdAt: dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          dailyTotal: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyEarnings = daily.map(d => ({
      date:   d._id,
      amount: d.dailyTotal
    }));

    // 4) Respond
    return res.json({
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      monthlyEarnings
    });

  } catch (err) {
    console.error("🔥 [getSellerEarnings] ERROR:", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message, stack: err.stack });
  }
};
