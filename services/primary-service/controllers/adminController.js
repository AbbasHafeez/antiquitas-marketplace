const User = require("../models/User")
const Product = require("../models/Product")
const Order = require("../models/Order")
const Dispute = require("../models/Dispute")
const asyncHandler = require("express-async-handler")
const { sendNotification } = require("../services/notificationService")

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total users count
  const totalUsers = await User.countDocuments()

  // Get total products count
  const totalProducts = await Product.countDocuments()

  // Get total orders count
  const totalOrders = await Order.countDocuments()

  // Get pending verifications count
  const pendingVerifications = await Product.countDocuments({ isVerified: false })

  // Get active disputes count
  const activeDisputes = await Dispute.countDocuments({ status: { $in: ["pending", "under_review"] } })

  // Get total revenue
  const orders = await Order.find({ isPaid: true })
  const revenue = orders.reduce((total, order) => total + order.totalPrice, 0)

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    pendingVerifications,
    activeDisputes,
    revenue,
  })
})

// @desc    Get recent orders for admin dashboard
// @route   GET /api/admin/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async (req, res) => {
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email")

  res.json(recentOrders)
})

// @desc    Get pending product verifications for admin dashboard
// @route   GET /api/admin/dashboard/pending-products
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const pendingProducts = await Product.find({ isVerified: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("seller", "name shopName")
    .populate("category", "name")

  res.json(pendingProducts)
})

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const query = {}

  // Apply role filter if provided
  if (req.query.role && req.query.role !== "all") {
    query.role = req.query.role
  }

  // Apply status filter if provided
  if (req.query.status && req.query.status !== "all") {
    if (req.query.status === "unverified") {
      query.isVerified = false
    } else {
      query.status = req.query.status
    }
  }

  // Apply search if provided
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
      { shopName: { $regex: req.query.search, $options: "i" } },
    ]
  }

  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

  const total = await User.countDocuments(query)

  res.json({
    users,
    page,
    pages: Math.ceil(total / limit),
    total,
  })
})

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.role = req.body.role || user.role
    user.status = req.body.status || user.status
    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified
    user.phone = req.body.phone || user.phone

    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        state: req.body.address.state || user.address?.state,
        postalCode: req.body.address.postalCode || user.address?.postalCode,
        country: req.body.address.country || user.address?.country,
      }
    }

    // Role-specific fields
    if (user.role === "seller") {
      user.shopName = req.body.shopName || user.shopName
      user.shopDescription = req.body.shopDescription || user.shopDescription
    }

    if (user.role === "shipper") {
      user.company = req.body.company || user.company
      user.serviceAreas = req.body.serviceAreas || user.serviceAreas
    }

    const updatedUser = await user.save()

    res.json(updatedUser)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    // Check if user is an admin
    if (user.role === "admin") {
      res.status(400)
      throw new Error("Cannot delete admin user")
    }

    await user.remove()
    res.json({ message: "User removed" })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  if (!status || !["active", "suspended"].includes(status)) {
    res.status(400)
    throw new Error("Invalid status")
  }

  const user = await User.findById(req.params.id)

  if (user) {
    // Check if user is an admin
    if (user.role === "admin") {
      res.status(400)
      throw new Error("Cannot update admin user status")
    }

    user.status = status
    const updatedUser = await user.save()

    res.json(updatedUser)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Get products pending verification
// @route   GET /api/admin/products/pending
// @access  Private/Admin
const getPendingVerificationProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const query = { isVerified: false }

  // Apply search if provided
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ]
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("seller", "name shopName")
    .populate("category", "name")

  const total = await Product.countDocuments(query)

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  })
})

// @desc    Verify (approve) a product
// @route   PUT /api/admin/products/:id/verify
// @access  Private/Admin
const verifyProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error("Product not found")
  }

  product.isVerified        = true
  product.verifiedBy        = req.user._id
  product.verificationDate  = Date.now()

  await product.save()

  // optional: notify the seller that their product was approved
  await sendNotification(product.seller, {
    type:      "product_approved",
    message:   `Your product "${product.name}" has been approved!`,
    productId: product._id
  })

  res.json({ message: "Product verified successfully" })
})

// @desc    Reject a product
// @route   PUT /api/admin/products/:id/reject
// @access  Private/Admin
const rejectProduct = asyncHandler(async (req, res) => {
  const { reason } = req.body

  if (!reason) {
    res.status(400)
    throw new Error("Rejection reason is required")
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error("Product not found")
  }

  // Update product status
  product.isAvailable = false
  product.rejectionReason = reason
  product.rejectedBy = req.user._id
  product.rejectionDate = Date.now()

  await product.save()

  // Send notification to seller
  await sendNotification(product.seller, {
    type: "product_rejected",
    message: `Your product "${product.name}" has been rejected: ${reason}`,
    productId: product._id,
  })

  res.json({ message: "Product rejected successfully" })
})

// @desc    Get all disputes
// @route   GET /api/admin/disputes
// @access  Private/Admin
const getDisputes = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const query = {}

  // Apply status filter if provided
  if (req.query.status && req.query.status !== "all") {
    query.status = req.query.status
  }

  const disputes = await Dispute.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("order", "totalPrice createdAt")
    .populate("raisedBy", "name email")
    .populate("against", "name email")

  const total = await Dispute.countDocuments(query)

  res.json({
    disputes,
    page,
    pages: Math.ceil(total / limit),
    total,
  })
})

// @desc    Get dispute by ID
// @route   GET /api/admin/disputes/:id
// @access  Private/Admin
const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate("order")
    .populate("raisedBy", "name email")
    .populate("against", "name email")
    .populate("resolvedBy", "name")

  if (dispute) {
    res.json(dispute)
  } else {
    res.status(404)
    throw new Error("Dispute not found")
  }
})

// @desc    Resolve a dispute
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Private/Admin
const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, resolutionDetails } = req.body

  if (!resolution || !["refund", "replacement", "partial_refund", "no_action", "other"].includes(resolution)) {
    res.status(400)
    throw new Error("Invalid resolution")
  }

  if (!resolutionDetails) {
    res.status(400)
    throw new Error("Resolution details are required")
  }

  const dispute = await Dispute.findById(req.params.id)

  if (!dispute) {
    res.status(404)
    throw new Error("Dispute not found")
  }

  if (dispute.status === "resolved" || dispute.status === "closed") {
    res.status(400)
    throw new Error("Dispute is already resolved or closed")
  }

  // Update dispute
  dispute.status = "resolved"
  dispute.resolution = resolution
  dispute.resolutionDetails = resolutionDetails
  dispute.resolvedBy = req.user._id
  dispute.updatedAt = Date.now()

  await dispute.save()

  // Send notifications to both parties
  await sendNotification(dispute.raisedBy, {
    type: "dispute_resolved",
    message: `Your dispute has been resolved: ${resolution}`,
    orderId: dispute.order,
  })

  await sendNotification(dispute.against, {
    type: "dispute_resolved",
    message: `A dispute against you has been resolved: ${resolution}`,
    orderId: dispute.order,
  })

  res.json(dispute)
})

module.exports = {
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
}
