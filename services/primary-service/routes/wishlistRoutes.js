// server/routes/wishlistRoutes.js

const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

router
  .route("/")
  .get(getWishlist)       // GET    /api/wishlist        → returns { items: [...] }
  .post(addToWishlist)    // POST   /api/wishlist        → expects { productId }, returns updated { items }
  .delete(clearWishlist); // DELETE /api/wishlist        → clears all, returns { items: [] }

router
  .route("/:productId")
  .delete(removeFromWishlist); // DELETE /api/wishlist/:productId → removes one, returns updated { items }

module.exports = router;
