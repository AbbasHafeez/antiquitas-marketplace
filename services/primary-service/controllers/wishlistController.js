// server/controllers/wishlistController.js

const asyncHandler = require("express-async-handler");
const Wishlist     = require("../models/Wishlist");
const Product      = require("../models/Product");

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
exports.getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id })
    .populate({
      path: "product",
      populate: { path: "seller", select: "name shopName" },
    })
    .sort({ addedAt: -1 });

  res.json({ items });
});

/**
 * @desc    Add a product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  // ensure product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // skip if already in wishlist
  const exists = await Wishlist.findOne({
    user:    req.user._id,
    product: productId,
  });
  if (exists) {
    return res.status(400).json({ message: "Already in wishlist" });
  }

  await Wishlist.create({
    user:    req.user._id,
    product: productId,
  });

  // return updated list
  const items = await Wishlist.find({ user: req.user._id })
    .populate({
      path: "product",
      populate: { path: "seller", select: "name shopName" },
    })
    .sort({ addedAt: -1 });

  res.status(201).json({ items });
});

/**
 * @desc    Remove a single product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const entry = await Wishlist.findOne({
    user:    req.user._id,
    product: productId,
  });
  if (!entry) {
    return res.status(404).json({ message: "Not in wishlist" });
  }

  // **only change**: use deleteOne() rather than remove()
  await entry.deleteOne();

  // return updated list
  const items = await Wishlist.find({ user: req.user._id })
    .populate({
      path: "product",
      populate: { path: "seller", select: "name shopName" },
    })
    .sort({ addedAt: -1 });

  res.json({ items });
});

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
exports.clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.deleteMany({ user: req.user._id });
  res.json({ items: [] });
});
