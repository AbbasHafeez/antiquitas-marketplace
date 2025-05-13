// server/routes/shipmentAvailableRoutes.js

const express = require("express");
const { getAllAvailableShippers } = require("../controllers/shipmentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// only protect, no authRole
router.use(protect);

// GET /api/shipment/available
router.get("/available", getAllAvailableShippers);

module.exports = router;
