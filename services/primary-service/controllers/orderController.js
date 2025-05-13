// server/controllers/orderController.js

const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order");
const Product      = require("../models/Product");
const User         = require("../models/User");
const Transaction  = require("../models/Transaction");       // ← new
const { sendOrderNotification } = require("../services/notificationService");

/**
 * Helper: snapshot product data + compute server‐side prices.
 */
const buildPriceInfo = async (items) => {
  let itemsPrice = 0;

  for (const it of items) {
    const prod = await Product.findById(it.product).lean();
    if (!prod)             return { error: `Product not found: ${it.product}` };
    if (!prod.isAvailable) return { error: `Product not available: ${prod.name}` };

    itemsPrice += prod.price * it.quantity;

    it.seller = prod.seller;
    it.price  = prod.price;
    it.name   = prod.name;
    it.image  = prod.images?.[0] || null;
  }

  const shippingPrice = 10;                              // flat demo rate
  const taxPrice      = +(itemsPrice * 0.05).toFixed(2); // 5% VAT
  const totalPrice    = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

/**
 * POST /api/orders
 * Create a new order (buyer).
 */
const createOrder = asyncHandler(async (req, res) => {
  const items           = req.body.items || req.body.orderItems;
  const shippingAddress = req.body.shippingAddress;
  const paymentMethod   = req.body.paymentMethod;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items / orderItems array required" });
  }
  if (!shippingAddress?.street || !shippingAddress?.phone) {
    return res.status(400).json({ message: "Incomplete shipping address" });
  }
  if (!paymentMethod) {
    return res.status(400).json({ message: "paymentMethod is required" });
  }

  // Compute or verify prices
  let priceInfo = {
    itemsPrice:    req.body.itemsPrice,
    shippingPrice: req.body.shippingPrice,
    taxPrice:      req.body.taxPrice,
    totalPrice:    req.body.totalPrice,
  };
  const missingTotals = Object.values(priceInfo).some(v => v === undefined);

  if (missingTotals) {
    priceInfo = await buildPriceInfo(items);
    if (priceInfo.error) {
      return res.status(404).json({ message: priceInfo.error });
    }
  } else {
    // Ensure seller snapshot even if front-end passed prices
    await Promise.all(items.map(async it => {
      if (!it.seller) {
        const p = await Product.findById(it.product).select("seller").lean();
        if (p) it.seller = p.seller;
      }
    }));
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems:     items,
    shippingAddress,
    paymentMethod,
    ...priceInfo,
    status: "pending",
  });

  // Notify each seller
  const sellerIds = [ ...new Set(items.map(i => String(i.seller)).filter(Boolean)) ];
  await Promise.all(
    sellerIds.map(sid =>
      sendOrderNotification(sid, {
        type:    "new_order",
        message: "You have received a new order",
        orderId: order._id,
      })
    )
  );

  res.status(201).json(order);
});

/**
 * GET /api/orders/:id
 * Fetch a single order (buyer/seller/shipper/admin).
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate({
      path: "orderItems.product",
      populate: { path: "seller", select: "name shopName" },
    });

  if (!order) return res.status(404).json({ message: "Order not found" });

  const isBuyer  = order.user._id.equals(req.user._id);
  const isSeller = order.orderItems.some(it =>
    it.product?.seller?._id.equals(req.user._id)
  );
  const allowedRoles = ["admin", "shipper"];

  if (!isBuyer && !isSeller && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.json(order);
});

/**
 * PUT /api/orders/:id/pay
 * Mark an order as paid (buyer).
 */
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.isPaid        = true;
  order.paidAt        = Date.now();
  order.paymentResult = {
    id:          req.body.id,
    status:      req.body.status,
    update_time: req.body.update_time,
    email:       req.body.email_address,
  };

  await order.save();

  // Notify buyer
  await sendOrderNotification(order.user, {
    type:    "order_paid",
    message: "Your payment has been received",
    orderId: order._id,
  });

  res.json(order);
});

/**
 * PUT /api/orders/:id/status
 * Update order status.
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;
  const validStatuses = ["pending","processing","shipped","delivered","cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id)
    .populate("orderItems.product","seller price quantity");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const role      = req.user.role;
  const isSeller  = order.orderItems.some(i =>
    String(i.product.seller) === String(req.user._id)
  );
  const isCarrier = String(order.shipment?.carrier) === String(req.user._id);

  // Authorization
  if (
    (role === "buyer"  && !(status === "cancelled" && order.status === "pending" && order.user.equals(req.user._id))) ||
    (role === "seller" && !["processing","cancelled"].includes(status)) ||
    (role === "shipper" && !["shipped","delivered"].includes(status))
  ) {
    return res.status(403).json({ message: "Not authorized for this update" });
  }

  order.status = status;
  if (status === "delivered") {
    order.deliveredAt = Date.now();

    // ─── create Transaction(s) ───
    // sum up by seller across this order
    const sellerTotals = {};
    order.orderItems.forEach(it => {
      const sid = String(it.seller);
      const line = (it.price||0) * (it.quantity||1);
      sellerTotals[sid] = (sellerTotals[sid]||0) + line;
    });

    // persist one Transaction per seller
    await Promise.all(Object.entries(sellerTotals).map(([sid, amount]) =>
      Transaction.create({
        seller: sid,
        order:  order._id,
        amount,
        status: "completed",   // ← mark it completed immediately
        date:   new Date(),
      })
    ));
  }
  if (status === "cancelled") {
    order.cancelReason = cancelReason;
  }

  await order.save();

  // Notify buyer
  await sendOrderNotification(order.user, {
    type:    "order_status_update",
    message: `Your order status is now ${status}`,
    orderId: order._id,
  });

  res.json(order);
});

/**
 * PUT /api/orders/:id/assign
 * Assign order to shipper (admin).
 */
const assignOrderToShipper = asyncHandler(async (req, res) => {
  const { shipperId, trackingNumber, estimatedDelivery } = req.body;

  // ① populate orderItems.product so we have .seller, .price & .quantity
  const order = await Order.findById(req.params.id)
    .populate("orderItems.product", "seller price quantity");
  const shipper = await User.findById(shipperId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!shipper || shipper.role !== "shipper") {
    return res.status(400).json({ message: "Invalid shipper" });
  }

  order.shipment = {
    carrier:           shipperId,
    trackingNumber,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
  };

  // ② only when moving from processing → shipped do we create txs
  if (order.status === "processing") {
    order.status = "shipped";

    // sum up each seller’s line‐items
    const sellerTotals = {};
    order.orderItems.forEach(it => {
      const sid  = String(it.product.seller);
      const line = (it.product.price || 0) * (it.quantity || 1);
      sellerTotals[sid] = (sellerTotals[sid] || 0) + line;
    });

    // write one Transaction per seller
    await Promise.all(
      Object.entries(sellerTotals).map(([sellerId, amount]) =>
        Transaction.create({
          seller: sellerId,
          order:  order._id,
          amount,
          status: "pending",
          date:   new Date(),
        })
      )
    );
  }

  await order.save();

  await sendOrderNotification(order.user, {
    type:    "order_shipped",
    message: "Your order has been shipped",
    orderId: order._id,
  });
  await sendOrderNotification(shipperId, {
    type:    "order_assigned",
    message: "A new order has been assigned to you",
    orderId: order._id,
  });

  res.json(order);
});


/**
 * PUT /api/orders/:id/delivery-proof
 * Shipper uploads proof & marks delivered.
/**
 * PUT /api/orders/:id/delivery-proof
 * Shipper uploads proof & marks delivered.
 */
const uploadDeliveryProof = asyncHandler(async (req, res) => {
  const { proofImage } = req.body;
  const order = await Order.findById(req.params.id)
    .populate("orderItems.product", "seller price quantity");
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (String(order.shipment?.carrier) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // 1) mark the order delivered
  order.deliveryProof = proofImage;
  order.status        = "delivered";
  order.deliveredAt   = Date.now();
  await order.save();

  // 2) COMPLETE any existing pending payout(s) for this order
  await Transaction.updateMany(
    { order: order._id, status: "pending" },
    { $set: { status: "completed", date: new Date() } }
  );

  // 3) notify buyer
  await sendOrderNotification(order.user, {
    type:    "order_delivered",
    message: "Your order has been delivered",
    orderId: order._id,
  });

  res.json(order);
});


/**
 * GET /api/orders/myorders
 * Buyer’s own orders.
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort("-createdAt")
    .populate("orderItems.product","name image");
  res.json(orders);
});
/**
 * GET /api/orders/seller
 * Orders for this seller, with optional
 *   ?page=&limit=&status=&search=
 */
const getSellerOrders = asyncHandler(async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  // 1️⃣ Fetch ALL orders, but only populate the items that belong to this seller
  let orders = await Order.find()
    .populate("user", "name")
    .populate({
      path: "orderItems.product",
      match: { seller: req.user._id },
      select: "name image price seller",
    })
    .sort({ createdAt: -1 });

  // 2️⃣ Keep only orders that actually have at least one item for this seller
  orders = orders.filter(o =>
    o.orderItems.some(it => !!it.product)
  );

  // 3️⃣ Filter by status (if provided)
  if (req.query.status && req.query.status !== "all") {
    orders = orders.filter(o => o.status === req.query.status);
  }

  // 4️⃣ Filter by ID search (if provided)
  if (req.query.search) {
    const q = req.query.search.replace(/^#/, "").toLowerCase();
    orders = orders.filter(o =>
      o._id.toString().toLowerCase().includes(q)
    );
  }

  // 5️⃣ Pagination
  const total = orders.length;
  const pages = Math.ceil(total / limit);
  const paginated = orders.slice(skip, skip + limit);

  res.json({ orders: paginated, pages });
});


/**
 * GET /api/orders/shipper
 * Orders assigned to the logged-in shipper, with optional
 *   ?page=&limit=&status=&search=&startDate=
 */
const getShipperOrders = asyncHandler(async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  // 1️⃣ Base Mongo filter: only this shipper’s orders
  const mongoFilter = { "shipment.carrier": req.user._id };
  if (req.query.status && req.query.status !== "all") {
    mongoFilter.status = req.query.status;
  }
  if (req.query.startDate) {
    mongoFilter.deliveredAt = { $gte: new Date(req.query.startDate) };
  }

  // 2️⃣ Fetch & populate user
  let orders = await Order.find(mongoFilter)
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .populate("orderItems.product", "name image");

  // 3️⃣ Apply text search on order ID or customer name
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    orders = orders.filter(o => {
      const idMatch   = o._id.toString().toLowerCase().includes(q);
      const nameMatch = o.user?.name?.toLowerCase().includes(q);
      return idMatch || nameMatch;
    });
  }

  // 4️⃣ Compute pagination
  const total = orders.length;
  const pages = Math.ceil(total / limit);

  // 5️⃣ Slice out the current page
  const paginated = orders.slice(skip, skip + limit);

  res.json({
    orders: paginated,
    page,
    pages,
    total
  });
});


module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  assignOrderToShipper,
  uploadDeliveryProof,
  getMyOrders,
  getSellerOrders,
  getShipperOrders,
};
