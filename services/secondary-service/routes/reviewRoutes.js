const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, product, rating, title, comment]
 *             properties:
 *               user:
 *                 type: string
 *               product:
 *                 type: string
 *               rating:
 *                 type: integer
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post("/", createReview);

/**
 * @swagger
 * /api/reviews/product/{id}:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product reviews
 */
router.get("/product/:id", getProductReviews);

/**
 * @swagger
 * /api/reviews/user/{id}:
 *   get:
 *     summary: Get reviews by user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user reviews
 */
router.get("/user/:id", getUserReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 */
router.put("/:id", updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete("/:id", deleteReview);

module.exports = router;