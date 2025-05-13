"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaStar,
  FaCheck,
  FaShippingFast,
} from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

// Helper to normalize API responses to an array
const normalize = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data.items)
    ? data.items
    : [];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    // 1) fetch product details
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${id}`);
        console.log("[ProductDetails] ▶️ fetched product:", data);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError("Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    // 2) check if it's in wishlist
    const checkWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await axios.get("/api/wishlist", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const items = normalize(data);
        const found = items.some((item) => item.product._id === id);
        console.log("[ProductDetails] ▶️ in wishlist:", found);
        setInWishlist(found);
      } catch (err) {
        console.error("Failed to check wishlist:", err);
      }
    };

    // 3) check purchase status
    const checkPurchaseStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await axios.get("/api/orders/myorders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const orders = normalize(data);
        const purchased = orders.some((order) =>
          order.status === "delivered" &&
          order.orderItems.some((item) => item.product._id === id)
        );
        console.log("[ProductDetails] ▶️ hasPurchased:", purchased);
        setHasPurchased(purchased);
      } catch (err) {
        console.error("Failed to check purchase status:", err);
      }
    };

    // 4) check review status
    const checkReviewStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await axios.get("/api/reviews/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const reviews = normalize(data);
        const reviewed = reviews.some((r) => r.product._id === id);
        console.log("[ProductDetails] ▶️ hasReviewed:", reviewed);
        setHasReviewed(reviewed);
      } catch (err) {
        console.error("Failed to check review status:", err);
      }
    };

    fetchProduct();
    checkWishlist();
    checkPurchaseStatus();
    checkReviewStatus();
  }, [id, isAuthenticated]);

  const handleQuantityChange = (e) => {
    const v = parseInt(e.target.value, 10);
    setQuantity(v > 0 ? v : 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }
    try {
      if (inWishlist) {
        console.log("[ProductDetails] ▶️ removing from wishlist", id);
        await axios.delete(`/api/wishlist/${id}`);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        console.log("[ProductDetails] ▶️ adding to wishlist", id);
        await axios.post("/api/wishlist", { productId: id });
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Images */}
          <div>
            <div className="relative pb-[75%] overflow-hidden rounded-lg mb-4">
              <img
                src={product.images[activeImage] || "/placeholder.svg"}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
              {product.isVerified && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full flex items-center">
                  <FaCheck className="mr-1" /> Verified Antique
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`cursor-pointer border-2 rounded-md overflow-hidden ${
                    activeImage === idx ? "border-primary-600" : "border-gray-200"
                  }`}
                  onClick={() => setActiveImage(idx)}
                >
                  <div className="relative pb-[75%]">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500 mr-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(product.averageRating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-primary-700 mb-2">
                ${product.price.toFixed(2)}
              </p>
              {product.originalPrice && (
                <p className="text-lg text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Product Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Age:</span> {product.age} years
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Origin:</span> {product.origin}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Condition:</span>{" "}
                    <span className="capitalize">{product.condition}</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Category:</span>{" "}
                    {product.category.name}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Seller:</span>{" "}
                    {product.seller.shopName || product.seller.name}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Availability:</span>{" "}
                    {product.isAvailable ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description & Additional */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div
                className="text-gray-700 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
            {product.additionalInfo && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  Additional Information
                </h2>
                <p className="text-gray-700">{product.additionalInfo}</p>
              </div>
            )}

            {/* Actions */}
            {product.isAvailable && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="mr-4 font-medium">
                    Quantity:
                  </label>
                  <div className="flex items-center border rounded-md">
                    <button
                      className="px-3 py-1 border-r"
                      onClick={() =>
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center py-1 focus:outline-none"
                    />
                    <button
                      className="px-3 py-1 border-l"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <FaShoppingCart className="mr-2" /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-secondary-600 text-white py-3 px-6 rounded-md hover:bg-secondary-700"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-md border ${
                      inWishlist
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                    aria-label={
                      inWishlist
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {inWishlist ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>

                <div className="mt-4 flex items-center text-gray-600">
                  <FaShippingFast className="mr-2" />
                  <span>Free shipping on orders over $100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t mt-8 p-6">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {isAuthenticated && hasPurchased && !hasReviewed && (
            <div className="mb-8">
              <button
                onClick={() => setShowReviewForm((v) => !v)}
                className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
              >
                Write a Review
              </button>
              {showReviewForm && (
                <div className="mt-4">
                  <ReviewForm
                    productId={id}
                    onReviewSubmitted={() => {
                      setShowReviewForm(false);
                      setHasReviewed(true);
                      // refresh product data
                      axios
                        .get(`/api/products/${id}`)
                        .then(({ data }) => setProduct(data))
                        .catch((e) =>
                          console.error("Failed to refresh product:", e)
                        );
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <ReviewList productId={id} />
        </div>
      </div>
    </div>
  );
}
