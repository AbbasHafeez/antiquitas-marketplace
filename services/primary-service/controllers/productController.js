/* -------------------------------------------------------------------------- */
/*  Product controller – public + seller/admin                                */
/* -------------------------------------------------------------------------- */

const asyncHandler  = require("express-async-handler");
const mongoose      = require("mongoose");
const Product       = require("../models/Product");
const Category      = require("../models/Category");

/* small helper so we don’t blow up with a CastError ----------------------- */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─── NEW: simple location validator (expects GeoJSON Point) --------------- */
const isValidPoint = (loc) =>
  loc &&
  loc.type === "Point" &&
  Array.isArray(loc.coordinates) &&
  loc.coordinates.length === 2 &&
  loc.coordinates.every((n) => typeof n === "number");

/* -------------------------------------------------------------------------- */
/* GET /api/products  – list / search / paginate                              */
/* -------------------------------------------------------------------------- */
const getProducts = asyncHandler(async (req, res) => {
  try {                              // ─── NEW ── begin try
    const query = {};

    /* ── search ────────────────────────────────────────────────────── */
    if (req.query.search) {
      query.$or = [
        { name:        { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    /* ── category filter ───────────────────────────────────────────── */
    if (req.query.category) query.category = req.query.category;

    /* ── price range ───────────────────────────────────────────────── */
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = +req.query.minPrice;
      if (req.query.maxPrice) query.price.$lte = +req.query.maxPrice;
    }

    /* ── verified only? ────────────────────────────────────────────── */
    if (req.query.verified === "true") query.isVerified = true;

    /* ── location near? (optional) ─────────────────────────────────── */
    if (req.query.lat && req.query.lng && req.query.radiusKm) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const rkm = parseFloat(req.query.radiusKm);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Number.isFinite(rkm)
      ) {
        const earthRadiusKm = 6378.1;
 query.location = {
   $geoWithin: {
     $centerSphere: [[lng, lat], rkm / earthRadiusKm], // radius in radians
   },
 };
      }
    }

    /* always return only sellable items */
    query.isAvailable = true;

    /* ── sort options ──────────────────────────────────────────────── */
    const sortMap = {
      newest      : { createdAt     : -1 },
      "price-low" : { price         :  1 },
      "price-high": { price         : -1 },
      rating      : { averageRating : -1 },
      featured    : { isVerified: -1, averageRating: -1 },
    };
    const sortBy   = req.query.sortBy ?? "featured";
    const sortOpts = sortMap[sortBy] ?? sortMap.featured;

    /* ── pagination ───────────────────────────────────────────────── */
    const page  = +req.query.page  || 1;
    const limit = +req.query.limit || 12;
    const skip  = (page - 1) * limit;

    /* ── DB query ────────────────────────────────────────────────────── */
const mongoQuery = Product.find(query)
.populate("category", "name")
.populate("seller",   "name shopName")
.sort(sortOpts)        // safe even when query.location has $geoWithin
.skip(skip)
.limit(limit);

const [products, total] = await Promise.all([
mongoQuery.exec(),
Product.countDocuments(query),
]);

res.json({
products,
page,
pages: Math.ceil(total / limit),
total,
});

  } catch (err) {                    // ─── NEW ── catch and log
    console.error("[getProducts]", err);
    res.status(500).json({ message: "Server error" });
  }                                  // ─── NEW ── end try/catch
});


/* -------------------------------------------------------------------------- */
/* GET /api/products/:id  – single product (public)                           */
/* -------------------------------------------------------------------------- */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("seller",   "name shopName shopLogo")
    .populate({
      path    : "reviews",
      populate: { path: "user", select: "name" },
    });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

/* -------------------------------------------------------------------------- */
/* POST /api/products  – create (seller / admin)                              */
/* -------------------------------------------------------------------------- */
const createProduct = asyncHandler(async (req, res) => {
  if (!(await Category.exists({ _id: req.body.category }))) {
    res.status(400);
    throw new Error("Invalid category");
  }

  /* ─── NEW: require valid location field ─── */
  if (!isValidPoint(req.body.location)) {
    res.status(400);
    throw new Error("Location {type:'Point', coordinates:[lng,lat]} is required");
  }

  const product = await Product.create({
    name           : req.body.name,
    description    : req.body.description,
    price          : req.body.price,
    images         : req.body.images,
    category       : req.body.category,
    seller         : req.user._id,
    isAvailable    : req.body.isAvailable,
    age            : req.body.age,
    origin         : req.body.origin,
    condition      : req.body.condition,
    additionalInfo : req.body.additionalInfo,
    /* ─── NEW ─── */
    location       : req.body.location,
  });

  res.status(201).json(product);
});

/* -------------------------------------------------------------------------- */
/* PUT /api/products/:id  – update (seller / admin)                           */
/* -------------------------------------------------------------------------- */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this product");
  }

  if (req.body.category &&
      !(await Category.exists({ _id: req.body.category }))) {
    res.status(400);
    throw new Error("Invalid category");
  }

  /* ─── NEW: validate location if provided ─── */
  if (req.body.location && !isValidPoint(req.body.location)) {
    res.status(400);
    throw new Error("Invalid location format");
  }

  /* merge only the fields that came from the client */
  Object.assign(product, req.body);

  res.json(await product.save());
});

/* -------------------------------------------------------------------------- */
/* DELETE /api/products/:id  – delete (seller / admin)                        */
/* -------------------------------------------------------------------------- */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this product");
  }

  await product.deleteOne();
  res.json({ message: "Product removed" });
});

/* -------------------------------------------------------------------------- */
/* PUT /api/products/:id/verify  – admin mark verified                        */
/* -------------------------------------------------------------------------- */
const verifyProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isVerified       = true;
  product.verifiedBy       = req.user._id;
  product.verificationDate = Date.now();

  res.json(await product.save());
});

/* -------------------------------------------------------------------------- */
/* GET /api/products/top  – top-rated (public)                                */
/* -------------------------------------------------------------------------- */
const getTopProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isAvailable: true })
    .sort({ averageRating: -1 })
    .limit(5)
    .populate("category", "name")
    .populate("seller",   "name shopName");

  res.json(products);
});

/* -------------------------------------------------------------------------- */
/* GET /api/products/seller  – seller’s own catalogue                         */
/* -------------------------------------------------------------------------- */
const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  /* always send an array so front-end .map() never crashes */
  res.json(Array.isArray(products) ? products : []);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProduct,
  getTopProducts,
  getSellerProducts,
};
