/**
 * controller/sellerController.js
 * --------------------------------
 * End-points used by routes/sellerRoutes.js and routes/productRoutes.js
 *
 *   • GET /api/seller/stats
 *   • GET /api/seller/top-products
 *   • GET /api/products/seller   ← returns the seller’s own catalogue
 */

const asyncHandler = require("express-async-handler");
const mongoose    = require("mongoose");
const Product     = require("../models/Product");
const Order       = require("../models/Order");

/* ──────────────────────────────────────────────────────────────
   GET  /api/seller/stats   →  { totalProducts, pendingProducts, … }
   ---------------------------------------------------------------- */
exports.getStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [totalProducts, pendingProducts, totalOrders, earningsAgg] =
    await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, isVerified: false }),
      Order.countDocuments({ seller: sellerId }),
      Order.aggregate([
        { $match: { seller: sellerId, status: "delivered" } },
        { $group: { _id: null, sum: { $sum: "$totalPrice" } } },
      ]),
    ]);

  res.json({
    totalProducts,
    pendingProducts,
    totalOrders,
    totalEarnings: earningsAgg.length ? earningsAgg[0].sum : 0,
  });
});

/* ──────────────────────────────────────────────────────────────
   GET  /api/seller/top-products   →  top 5 by quantity sold
   ---------------------------------------------------------------- */
exports.getTopProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const products = await Order.aggregate([
    { $match: { seller: sellerId, status: "delivered" } },
    { $unwind: "$orderItems" },
    { $group: {
        _id : "$orderItems.product",
        sold: { $sum: "$orderItems.qty" },
      }},
    { $sort : { sold: -1 } },
    { $limit: 5 },
    { $lookup: {
        from         : "products",
        localField   : "_id",
        foreignField : "_id",
        as           : "product",
      }},
    { $unwind: "$product" },
    { $project: {
        _id   : "$product._id",
        sold  : 1,
        name  : "$product.name",
        price : "$product.price",
        images: "$product.images",
        isVerified: "$product.isVerified",
      }},
  ]);

  res.json(products);
});

/* ──────────────────────────────────────────────────────────────
   GET  /api/products/seller   →  seller’s own catalogue
   ---------------------------------------------------------------- */
exports.getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const products = await Product.find({ seller: sellerId })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  /* Always succeed – empty list is valid */
  res.json(Array.isArray(products) ? products : []);
});
