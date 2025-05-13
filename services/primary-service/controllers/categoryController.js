const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const Product = require("../models/Product");

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);                    // always an array
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent } = req.body;

  if (await Category.findOne({ name })) {
    res.status(400);
    throw new Error("Category already exists");
  }

  if (parent && !(await Category.findById(parent))) {
    res.status(400);
    throw new Error("Parent category not found");
  }

  const category = await Category.create({ name, description, image, parent });
  res.status(201).json(category);
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (parent) {
    if (parent === req.params.id) {
      res.status(400);
      throw new Error("Category cannot be its own parent");
    }
    if (!(await Category.findById(parent))) {
      res.status(400);
      throw new Error("Parent category not found");
    }
  }

  category.name = name ?? category.name;
  category.description = description ?? category.description;
  category.image = image ?? category.image;
  category.parent = parent ?? category.parent;

  const updated = await category.save();
  res.json(updated);
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (await Category.exists({ parent: req.params.id })) {
    res.status(400);
    throw new Error("Cannot delete category with child categories");
  }

  if (await Product.exists({ category: req.params.id })) {
    res.status(400);
    throw new Error("Cannot delete category with products");
  }

  await category.remove();
  res.json({ message: "Category removed" });
});
