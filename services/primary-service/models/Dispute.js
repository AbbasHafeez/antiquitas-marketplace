const mongoose = require("mongoose")

const DisputeSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: [true, "Please provide a reason for the dispute"],
    enum: [
      "damaged_item",
      "wrong_item",
      "item_not_received",
      "item_not_as_described",
      "counterfeit_item",
      "payment_issue",
      "other",
    ],
  },
  description: {
    type: String,
    required: [true, "Please provide a description of the dispute"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  evidence: [
    {
      type: String, // URLs to uploaded images
    },
  ],
  status: {
    type: String,
    enum: ["pending", "under_review", "resolved", "closed"],
    default: "pending",
  },
  resolution: {
    type: String,
    enum: ["refund", "replacement", "partial_refund", "no_action", "other"],
  },
  resolutionDetails: {
    type: String,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
DisputeSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("Dispute", DisputeSchema)
