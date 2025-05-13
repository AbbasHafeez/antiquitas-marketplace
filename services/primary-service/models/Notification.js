const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "new_order",
      "order_status_update",
      "order_paid",
      "order_shipped",
      "order_delivered",
      "order_assigned",
      "product_approved",
      "product_rejected",
      "new_message",
      "review_received",
      "system",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Notification", NotificationSchema)
