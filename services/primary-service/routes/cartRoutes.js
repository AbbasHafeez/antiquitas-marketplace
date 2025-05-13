/**
 * routes/cartRoutes.js  ― v2
 *
 * All cart actions are protected.  
 * POST `/api/cart` now **replaces** the entire cart with
 * `{ items: [{ product:<ObjectId>, quantity:<Number> }, …] }`
 * which matches the updated front-end payload.
 */

const express  = require("express");
const {
  getCart,            // GET    /api/cart
  replaceCart,        // POST   /api/cart
  updateItemQty,      // PUT    /api/cart/:productId
  removeItem,         // DELETE /api/cart/:productId
  clearCart           // DELETE /api/cart
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

/* ────────────────── whole-cart endpoints ────────────────── */
// GET  /api/cart               → returns { items:[…], total, count }
router.get   ("/", protect, getCart);

// POST /api/cart               → replace entire cart
// body: { items:[{ product, quantity }] }
router.post  ("/", protect, replaceCart);

// DELETE /api/cart             → empty cart
router.delete("/", protect, clearCart);

/* ────────────────── item-level endpoints ────────────────── */
// PUT    /api/cart/:productId  → change qty (body: { quantity })
router.put   ("/:productId", protect, updateItemQty);

// DELETE /api/cart/:productId  → remove one item
router.delete("/:productId", protect, removeItem);

module.exports = router;
