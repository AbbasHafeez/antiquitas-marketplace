// server/routes/orderRoutes.js
/**
 * routes/orderRoutes.js  – complete & up-to-date
 *
 * URL prefix:  /api/orders
 */

const express = require("express");
const router  = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  assignOrderToShipper,
  uploadDeliveryProof,
  getMyOrders,
  getSellerOrders,
  getShipperOrders,
} = require("../controllers/orderController");

const { protect, authRole } = require("../middleware/auth");

/* ───────────────────────────────────────────────────────────────*/
/*  PUBLIC / ADMIN (OPTIONAL)                                     */
/* ───────────────────────────────────────────────────────────────*/
// If you later need a full admin list, uncomment below:
//
// const { getAllOrders } = require("../controllers/orderController");
// router.get("/", protect, authRole("admin"), getAllOrders);

/* ───────────────────────────────────────────────────────────────*/
/*  BUYER ROUTES                                                  */
/* ───────────────────────────────────────────────────────────────*/
router
  .route("/")
  .post(protect, createOrder);                 // POST /api/orders

router.get("/myorders", protect, getMyOrders); // GET  /api/orders/myorders

/* ───────────────────────────────────────────────────────────────*/
/*  SELLER ROUTES                                                 */
/* ───────────────────────────────────────────────────────────────*/
router.get(
  "/seller",
  protect,
  authRole("seller"),
  getSellerOrders
);                                              // GET  /api/orders/seller

/* ───────────────────────────────────────────────────────────────*/
/*  SHIPPER ROUTES                                                */
/* ───────────────────────────────────────────────────────────────*/
router.get(
  "/shipper",
  protect,
  authRole("shipper"),
  getShipperOrders
);                                              // GET  /api/orders/shipper

router.put(
  "/:id/delivery-proof",
  protect,
  authRole("shipper"),
  uploadDeliveryProof
);                                              // PUT  /api/orders/:id/delivery-proof

/* ───────────────────────────────────────────────────────────────*/
/*  ASSIGN TO SHIPPER (SELLER or ADMIN)                           */
/* ───────────────────────────────────────────────────────────────*/
router.put(
  "/:id/assign",
  protect,
  // allow both sellers and admins to assign shipments
  (req, res, next) => {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to assign shipments" });
    }
    next();
  },
  assignOrderToShipper
);                                              // PUT  /api/orders/:id/assign

/* ───────────────────────────────────────────────────────────────*/
/*  MIXED ROUTES (buyer/seller/shipper/admin per controller)      */
/* ───────────────────────────────────────────────────────────────*/
router.get("/:id", protect, getOrderById);      // GET  /api/orders/:id

router.put("/:id/pay", protect, updateOrderToPaid);    // PUT  /api/orders/:id/pay

router.put("/:id/status", protect, updateOrderStatus); // PUT  /api/orders/:id/status

module.exports = router;
