const express = require("express")
const router = express.Router()
const { protect, admin } = require("../middleware/auth")
const {
  getDashboardStats,
  getRecentOrders,
  getPendingProducts,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getPendingVerificationProducts,
  verifyProduct,
  rejectProduct,
  getDisputes,
  getDisputeById,
  resolveDispute,
} = require("../controllers/adminController")

// Dashboard routes
router.get("/dashboard/stats", protect, admin, getDashboardStats)
router.get("/dashboard/recent-orders", protect, admin, getRecentOrders)
router.get("/dashboard/pending-products", protect, admin, getPendingProducts)

// User management routes
router.route("/users").get(protect, admin, getUsers)
router
  .route("/users/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser)
router.put("/users/:id/status", protect, admin, updateUserStatus)

// Product management routes
router.get("/products/pending", protect, admin, getPendingVerificationProducts)
router.put ("/products/:id/verify",   protect, admin, verifyProduct) 
router.put("/products/:id/reject", protect, admin, rejectProduct)

// Dispute management routes
router.get("/disputes", protect, admin, getDisputes)
router.get("/disputes/:id", protect, admin, getDisputeById)
router.put("/disputes/:id/resolve", protect, admin, resolveDispute)

module.exports = router
