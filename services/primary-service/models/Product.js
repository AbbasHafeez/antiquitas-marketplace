const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price must be positive"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price must be positive"],
    },
    images: {
      type: [String],
      required: [true, "Please add at least one image"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDate: Date,
    age: {
      type: Number,
      required: [true, "Please specify the age of the antique"],
    },
    origin: {
      type: String,
      required: [true, "Please specify the origin/country"],
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: [true, "Please specify the condition"],
    },
    additionalInfo: String,

    /* ───── NEW: geo‑location field ───── */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      addressText: String, // optional human‑readable address
    },

    averageRating: {
      type: Number,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

/* 2dsphere index for geo‑queries */
ProductSchema.index({ location: "2dsphere" })

// Virtual for reviews
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
})

// Update the averageRating when a review is added or updated
ProductSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { _id: productId },
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },
    {
      $project: {
        averageRating: { $avg: "$reviews.rating" },
        numReviews: { $size: "$reviews" },
      },
    },
  ])

  try {
    await this.findByIdAndUpdate(productId, {
      averageRating: obj[0]?.averageRating || 0,
      numReviews: obj[0]?.numReviews || 0,
    })
  } catch (err) {
    console.error(err)
  }
}

// Call getAverageRating after save
ProductSchema.post("save", function () {
  this.constructor.getAverageRating(this._id)
})

// Update timestamps
ProductSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() })
})

module.exports = mongoose.model("Product", ProductSchema)
