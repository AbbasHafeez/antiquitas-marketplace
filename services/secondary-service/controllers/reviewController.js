const asyncHandler = require("express-async-handler");
const Review = require("../models/reviewModel");
const axios = require("axios");
const redis = require("../config/redis");

/**
 * This controller no longer depends on primary-service models.
 * It uses dummy logic or HTTP API calls to primary-service (if needed).
 */

// @desc    Create a review
// @route   POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { product, user, rating, title, comment } = req.body;

  const alreadyReviewed = await Review.findOne({ user, product });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Product already reviewed");
  }

  const review = await Review.create({
    user,
    product,
    rating,
    title,
    comment,
  });

  // Invalidate Redis cache for this product
  await redis.del(`reviews:${product}`);

  res.status(201).json({ message: "Review added", review });
});

// @desc    Get reviews for a product (with Redis cache)
// @route   GET /api/reviews/product/:id
const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const cachedData = await redis.get(`reviews:${productId}`);
  if (cachedData) {
    console.log("⚡ Served from Redis");
    return res.json(JSON.parse(cachedData));
  }

  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 });

  await redis.set(`reviews:${productId}`, JSON.stringify(reviews), {
    EX: 300,
  });

  console.log("🧠 Served from MongoDB & cached");
  res.json(reviews);
});

// @desc    Get reviews by user
// @route   GET /api/reviews/user/:id
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.params.id })
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  review.rating = rating ?? review.rating;
  review.title = title ?? review.title;
  review.comment = comment ?? review.comment;
  await review.save();

  // Invalidate Redis cache for the product
  await redis.del(`reviews:${review.product}`);

  res.json({ message: "Review updated", review });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  await redis.del(`reviews:${review.product}`);
  await review.remove();
  res.json({ message: "Review deleted" });
});

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};