const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const { protect, authRole } = require("../middleware/auth");

/**
 * GET /api/admin/orders
 * Query params: page, limit, status, search
 * Returns: { orders: [...], page, pages }
 */
router.get(
     "/",
  protect,
  authRole("admin"),
  async (req, res) => {
    const page   = parseInt(req.query.page, 10)  || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const search = req.query.search;

    // Build Mongo filter
    const filter = {};
    if (status) filter.status = status;

    // Count first (un-filtered by name search)
    const total = await Order.countDocuments(filter);

    // Fetch page of orders, newest first
    let orders = await Order.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // If searching by ID or user.name, filter in-memory
    if (search) {
      const re = new RegExp(search, "i");
      orders = orders.filter(
        (o) =>
          o._id.toString().match(re) ||
          (o.user.name && o.user.name.match(re))
      );
    }

    return res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
    });
  }
);

module.exports = router;
