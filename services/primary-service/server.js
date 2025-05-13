require('dotenv').config(); 

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { protect, authRole } = require("./middleware/auth");
const { setupSocketIO } = require("./sockets/socketManager");

// Route modules (relative to current file)
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOrdersRouter = require("./routes/adminOrders");
const notificationRoutes = require("./routes/notificationRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const shipmentAvailableRoutes = require("./routes/shipmentAvailableRoutes");

dotenv.config();
connectDB();

const app = express();
//const PORT = process.env.PORT || 5000; // Fallback if PORT not set
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? false
      : ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
setupSocketIO(io);

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Upload routes ──
app.use("/api/upload", uploadRoutes);

// ── Public routes ──
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ── Protected routes ──
app.use("/api/orders", protect, orderRoutes);

app.use("/api/payment", protect, paymentRoutes);
app.use("/api/wishlist", protect, wishlistRoutes);
app.use("/api/cart", protect, cartRoutes);

// ── Seller routes ──
app.use("/api/seller", protect, authRole("seller"), sellerRoutes);

// ── Shipper routes ──
app.use("/api/shipper", protect, authRole("shipper"), shipmentRoutes);
app.use("/api/shipment", protect, shipmentRoutes);
app.use("/api/shipper/orders", protect, authRole("shipper"), orderRoutes);

// ── Admin routes ──
app.use("/api/admin", protect, authRole("admin"), adminRoutes);
app.use("/api/admin/orders", protect, authRole("admin"), adminOrdersRouter);

// ── Notifications ──
app.use("/api/notifications", protect, notificationRoutes);

// ── Shipment availability ──
app.use("/api/shipment", shipmentAvailableRoutes);

// ── Transactions ──
app.use("/api/transactions", transactionRoutes);

// ── Serve uploaded files ──
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { fallthrough: false }));

// ── React build for production ──
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../../client/build", "index.html"))
  );
}

// ── Global error handler ──
app.use(errorHandler);

const PORT = process.env.PORT || 5003;
server.listen(PORT, () =>
  console.log(`Primary Service running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);