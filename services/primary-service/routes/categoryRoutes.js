const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authRole } = require("../middleware/auth");

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only
router.post("/", protect, authRole("admin"), createCategory);
router.put("/:id", protect, authRole("admin"), updateCategory);
router.delete("/:id", protect, authRole("admin"), deleteCategory);

module.exports = router;
