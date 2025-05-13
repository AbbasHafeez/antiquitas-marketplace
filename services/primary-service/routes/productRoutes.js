/**********************************************************************
 * Product routes
 * --------------------------------------------------------------------
 *  Public:
 *    GET  /api/products               list / search / filter
 *    GET  /api/products/:id           single product by id
 *
 *  Seller / Admin (authRole):
 *    GET  /api/products/seller        seller’s own catalogue
 *    POST /api/products               create
 *    PUT  /api/products/:id/verify    mark verified  (admin only)
 *    PUT  /api/products/:id           update
 *    DEL  /api/products/:id           delete
 *********************************************************************/

const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProduct,
} = require("../controllers/productController");
const { getSellerProducts } = require("../controllers/sellerController");
const { protect, authRole } = require("../middleware/auth");
const { getProductWithEnhancedDetails /*, other controllers */ } = require('../controllers/productController');
const router = express.Router();

/* ──────────────── PUBLIC END-POINTS ──────────────── */

// list / search / filter
router.get("/", getProducts);

/* ──────────────── SELLER / ADMIN ──────────────── */

// seller’s own catalogue  (must be BEFORE '/:id')
router.get(
  "/seller",
  protect,
  authRole("seller", "admin"),
  getSellerProducts
);

router.get('/:id/enhanced', getProductWithEnhancedDetails); // New route

// create
router.post("/", protect, authRole("seller", "admin"), createProduct);

// verify (admin only) – place BEFORE generic '/:id'
router.put(
  "/:id/verify",
  protect,
  authRole("admin"),
  verifyProduct
);

// update
router.put("/:id", protect, authRole("seller", "admin"), updateProduct);

// delete
router.delete("/:id", protect, authRole("seller", "admin"), deleteProduct);

/* ──────────────── SINGLE PRODUCT (public) ──────────────── */

router.get("/:id", getProductById);

module.exports = router;