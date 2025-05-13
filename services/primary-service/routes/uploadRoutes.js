/* eslint-disable import/no-extraneous-dependencies */
const express        = require("express");
const path           = require("path");
const fs             = require("fs");
const multer         = require("multer");
const { protect, authRole } = require("../middleware/auth");

const router = express.Router();

/* ────────────────────────────────────────────────────────
   1. Multer configuration (shared by all routes)
   ──────────────────────────────────────────────────────── */
const makeDir = (folder) => {
  const dir = path.join(__dirname, "..", "uploads", folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const folder = req.uploadFolder || "general";
    cb(null, makeDir(folder));
  },
  filename(_req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random()*1e5)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /image\/(jpeg|png|gif|webp)/.test(file.mimetype);
  cb(null, ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

/* ────────────────────────────────────────────────────────
   2. Your existing routes (unchanged)
   ──────────────────────────────────────────────────────── */

/**
 * POST /api/upload
 * - any authenticated user
 * - fieldName: "file" (single)
 */
router.post(
  "/",
  protect,
  (req, _res, next) => { req.uploadFolder = "general"; next(); },
  upload.single("file"),
  (req, res) => {
    const url = `/uploads/general/${req.file.filename}`;
    res.status(201).json({ file: url });
  }
);

/**
 * POST /api/upload/product
 * - only seller or admin
 * - fieldName: "images" (array up to 4)
 */
router.post(
  "/product",
  protect,
  authRole("seller", "admin"),
  (req, _res, next) => { req.uploadFolder = "products"; next(); },
  upload.array("images", 4),
  (req, res) => {
    const files = req.files.map(f => `/uploads/products/${f.filename}`);
    res.status(201).json({ files });
  }
);

/* ────────────────────────────────────────────────────────
   3. The ONLY-changed /proof route
   ──────────────────────────────────────────────────────── */

/**
 * POST /api/upload/proof
 * - only shipper
 * - fieldName: "proofImage" (single)  ← must match your front-end
 */
router.post(
  "/proof",
  protect,
  authRole("shipper"),
  (req, _res, next) => { req.uploadFolder = "proofs"; next(); },
  upload.single("proofImage"),             // ← keep "proofImage" here
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No proof image uploaded" });
    }
    const filename = req.file.filename;
    const url      = `/uploads/proofs/${filename}`;
    // returning { file } keeps consistency with your other endpoints
    res.status(201).json({ file: url, filename });
  }
);

module.exports = router;
