/**
 * controllers/cartController.js  ― v3
 *
 * Accepts **either** payload shape:
 *   ✅ Whole cart  – { items:[{ product, quantity }] }
 *   ✅ Single item – { product, quantity }
 *
 * All responses always return [{ product, quantity }] with product populated.
 */

const asyncHandler = require("express-async-handler");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

/* ───────────── GET  /api/cart ───────────── */
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart ? cart.items : []);
});

/* ───────────── POST /api/cart  (replace or add-single) ───────────── */
exports.replaceCart = asyncHandler(async (req, res) => {
  /* ① normalise payload → items[] */
  let items = req.body.items;

  if (!items && req.body.product) {
    // front-end sent a single item
    items = [{ product: req.body.product, quantity: req.body.quantity || 1 }];
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items array or product+quantity required" });
  }

  /* ② validate */
  for (const it of items) {
    if (!it.product || !it.quantity)
      return res.status(400).json({ message: "Each item needs product + quantity" });

    if (it.quantity < 1)
      return res.status(400).json({ message: "Quantity must be ≥ 1" });

    const exists = await Product.exists({ _id: it.product });
    if (!exists)
      return res.status(404).json({ message: "Product not found: " + it.product });
  }

  /* ③ upsert cart */
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items },
    { new: true, upsert: true, runValidators: true }
  ).populate("items.product");

  res.status(200).json(cart.items);
});

/* ───────────── PUT /api/cart/:productId ───────────── */
exports.updateItemQty = asyncHandler(async (req, res) => {
  const { productId }   = req.params;
  const { quantity = 1} = req.body;

  if (quantity < 1)
    return res.status(400).json({ message: "Quantity must be ≥ 1" });

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  res.json(cart.items);
});

/* ───────────── DELETE /api/cart/:productId ───────────── */
exports.removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  await cart.populate("items.product");
  res.json(cart.items);
});

/* ───────────── DELETE /api/cart ───────────── */
exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.deleteOne({ user: req.user.id });
  res.json([]);
});
