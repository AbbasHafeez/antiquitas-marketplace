"use client";

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const ProductCard = ({ product, inWishlist = false, onWishlistToggle }) => {
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    // Delegate actual POST/DELETE + toast up to the parent
    onWishlistToggle?.(product._id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product._id}`} className="block relative">
        <div className="relative pb-[75%] overflow-hidden">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {product.isVerified && (
            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Verified Antique
            </div>
          )}

          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {inWishlist ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500" />
            )}
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center text-yellow-500">
              <FaStar />
              <span className="ml-1 text-gray-700">
                {product.averageRating?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description.replace(/<\/?[^>]+(>|$)/g, "")}
          </p>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-primary-700">
                ${product.price.toFixed(2)}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
              aria-label="Add to cart"
            >
              <FaShoppingCart />
            </button>
          </div>

          <div className="mt-3 flex items-center text-sm text-gray-500">
            <span>Seller: {product.seller.shopName || product.seller.name}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
