// server/routes/shipmentRoutes.js

const express = require("express");
const {
  getShipperStats,
  updateDeliveryStatus,
  uploadDeliveryProof,
  getShipperServiceAreas,
  updateShipperServiceAreas,
  assignShipperToOrder,
  getAvailableShippers,
  getAllAvailableShippers, // ✅ new import
} = require("../controllers/shipmentController");
const { protect, authRole } = require("../middleware/auth");

const router = express.Router();

// ── 1) All routes require a logged-in user ───────────────────────
router.use(protect);

/* ─── Shipper‐only endpoints ──────────────────────────────────────── */
/**
 * GET  /api/shipper/stats
 * Retrieve dashboard statistics for the logged‐in shipper.
 */
router.get(
  "/stats",
  authRole("shipper"),
  getShipperStats
);

/**
 * PUT  /api/shipper/orders/:id/status
 * Update an assigned order’s status (to "shipped" or "delivered").
 */
router.put(
  "/orders/:id/status",
  authRole("shipper"),
  updateDeliveryStatus
);

/**
 * PUT  /api/shipper/orders/:id/delivery-proof
 * Upload a delivery‐proof image and mark the order as delivered.
 */
router.put(
  "/orders/:id/delivery-proof",
  authRole("shipper"),
  uploadDeliveryProof
);

/**
 * GET  /api/shipper/service-areas
 * Fetch the current shipper’s service areas.
 */
router.get(
  "/service-areas",
  authRole("shipper"),
  getShipperServiceAreas
);

/**
 * PUT  /api/shipper/service-areas
 * Update the current shipper’s service areas.
 */
router.put(
  "/service-areas",
  authRole("shipper"),
  updateShipperServiceAreas
);

/* ─── Public to any logged-in user ───────────────────────────────── */
/**
 * GET  /api/shipper/shippers
 * List all active shippers (for dropdowns when assigning).
 * — no authRole here, so sellers and admins both can fetch
 */
router.get(
  "/shippers",
  getAvailableShippers
);

/**
 * GET  /api/shipment/available
 * ✅ New endpoint: List available shippers for seller order assignment.
 */
router.get(
  "/shipment/available",
  getAllAvailableShippers
);

/* ─── Admin / Seller helpers ─────────────────────────────────────── */
/**
 * POST /api/shipper/assign/:orderId
 * Assign a shipper to a pending order (admin or seller only).
 */
router.post(
  "/assign/:orderId",
  authRole("admin", "seller"),
  assignShipperToOrder
);

module.exports = router;
