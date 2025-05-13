// server/controllers/shipmentController.js
const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order");
const User         = require("../models/User");
const { sendNotification } = require("../services/notificationService");

const Transaction = require("../models/Transaction");

// @desc    Get shipper dashboard statistics
// @route   GET /api/shipper/stats
// @access  Private/Shipper
const getShipperStats = asyncHandler(async (req, res) => {
  const shipperId = req.user._id;

  const pendingDeliveries = await Order.countDocuments({
    "shipment.carrier": shipperId,
    status: { $in: ["processing", "shipped"] },
  });

  const completedDeliveries = await Order.countDocuments({
    "shipment.carrier": shipperId,
    status: "delivered",
  });

  const deliveryFeePerOrder = 5;
  const totalEarnings      = completedDeliveries * deliveryFeePerOrder;

  const allDeliveries = await Order.find({
    "shipment.carrier": shipperId,
    status: "delivered",
  }).select("deliveredAt shipment.estimatedDelivery");

  let onTime = 0;
  allDeliveries.forEach(o => {
    if (
      o.deliveredAt &&
      o.shipment.estimatedDelivery &&
      new Date(o.deliveredAt) <= new Date(o.shipment.estimatedDelivery)
    ) {
      onTime++;
    }
  });

  const deliveryRate = allDeliveries.length
    ? Math.round((onTime / allDeliveries.length) * 100)
    : 100;

  res.json({ pendingDeliveries, completedDeliveries, totalEarnings, deliveryRate });
});

// @desc    Update delivery status (shipper)
// @route   PUT /api/shipper/orders/:id/status
// @access  Private/Shipper
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["shipped", "delivered"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    !order.shipment ||
    order.shipment.carrier.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  order.status = status;
  if (status === "delivered") order.deliveredAt = Date.now();
  await order.save();

    // ─── COMPLETE any pending transaction(s) created when the order was shipped ───
 await Transaction.updateMany(
      { order: order._id, status: "pending" },
      { $set: { status: "completed", date: new Date() } }
    );
  
  

  await sendNotification(order.user, {
    type: "order_status_update",
    message: `Your order is now ${status}`,
    orderId: order._id,
  });

  res.json(order);
});

// @desc    Upload delivery proof (shipper)
// @route   PUT /api/shipper/orders/:id/delivery-proof
// @access  Private/Shipper
const uploadDeliveryProof = asyncHandler(async (req, res) => {
  const { proofImage } = req.body;
  if (!proofImage) {
    res.status(400);
    throw new Error("proofImage is required");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    !order.shipment ||
    order.shipment.carrier.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  order.deliveryProof = proofImage;
  order.status        = "delivered";
  order.deliveredAt   = Date.now();
  await order.save();

  await sendNotification(order.user, {
    type: "order_delivered",
    message: "Your order has been delivered",
    orderId: order._id,
  });

  res.json(order);
});

// @desc    Get shipper service areas
// @route   GET /api/shipper/service-areas
// @access  Private/Shipper
const getShipperServiceAreas = asyncHandler(async (req, res) => {
  const shipper = await User.findById(req.user._id).select("serviceAreas");
  if (!shipper) {
    res.status(404);
    throw new Error("Shipper not found");
  }
  res.json({ serviceAreas: shipper.serviceAreas || [] });
});

// @desc    Update shipper service areas
// @route   PUT /api/shipper/service-areas
// @access  Private/Shipper
const updateShipperServiceAreas = asyncHandler(async (req, res) => {
  const { serviceAreas } = req.body;
  if (!Array.isArray(serviceAreas)) {
    res.status(400);
    throw new Error("serviceAreas must be an array");
  }

  const shipper = await User.findById(req.user._id);
  if (!shipper) {
    res.status(404);
    throw new Error("Shipper not found");
  }

  shipper.serviceAreas = serviceAreas;
  await shipper.save();
  res.json({ serviceAreas });
});

// @desc    Assign shipper to order (admin only)
// @route   POST /api/shipper/assign/:orderId
// @access  Private/Admin
const assignShipperToOrder = asyncHandler(async (req, res) => {
  const { shipperId, trackingNumber, estimatedDelivery } = req.body;
  if (!shipperId) {
    res.status(400);
    throw new Error("shipperId is required");
  }

  const shipper = await User.findById(shipperId);
  if (!shipper || shipper.role !== "shipper") {
    res.status(400);
    throw new Error("Invalid shipper");
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.shipment = {
    carrier: shipperId,
    trackingNumber:
      trackingNumber || `TRK${Math.floor(100000 + Math.random() * 900000)}`,
    estimatedDelivery:
      estimatedDelivery != null
        ? new Date(estimatedDelivery)
        : new Date(Date.now() + 7 * 24 * 3600 * 1000),
  };
  if (order.status === "processing") order.status = "shipped";

  await order.save();

  await sendNotification(order.user, {
    type: "order_shipped",
    message: "Your order has been shipped",
    orderId: order._id,
  });
  await sendNotification(shipperId, {
    type: "order_assigned",
    message: "A new order was assigned to you",
    orderId: order._id,
  });

  res.json(order);
});

// @desc    Get all active shippers (admin only)
// @route   GET /api/shipper/shippers
// @access  Private/Admin
const getAvailableShippers = asyncHandler(async (req, res) => {
  const shippers = await User.find({ role: "shipper", status: "active" })
    .select("name email phone company serviceAreas")
    .sort("name");
  res.json(shippers);
});

// ✅ New Added Code Below
// @desc    Get all shippers (for sellers to assign)
// @route   GET /api/shipment/available
// @access  Private
const getAllAvailableShippers = asyncHandler(async (req, res) => {
  try {
    const shippers = await User.find({ role: "shipper", status: "active" })
      .select("name email phone company serviceAreas")
      .sort("name");
    res.json(shippers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch shippers" });
  }
});

module.exports = {
  getShipperStats,
  updateDeliveryStatus,
  uploadDeliveryProof,
  getShipperServiceAreas,
  updateShipperServiceAreas,
  assignShipperToOrder,
  getAvailableShippers,
  getAllAvailableShippers, // ✅ Don't forget to export the new one
};
