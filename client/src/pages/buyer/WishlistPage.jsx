"use client";

import { useState, useEffect, useContext } from "react";
import axios                                from "axios";
import { toast }                            from "react-toastify";
import { Link, useNavigate }               from "react-router-dom";
import { FaTrash, FaShoppingCart, FaHeart } from "react-icons/fa";
import { CartContext }                     from "../../context/CartContext";
import { AuthContext }                     from "../../context/AuthContext";

export default function WishlistPage() {
  const navigate       = useNavigate();
  const { addToCart }  = useContext(CartContext);
  const { token }      = useContext(AuthContext);

  const [wishlist, setWishlist] = useState([]);   // always an array
  const [loading,   setLoading] = useState(true);
  const [error,     setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get("/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // normalize both styles: array or { items: [...] }
        const list = Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        if (!cancelled) setWishlist(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load wishlist");
          toast.error(err.response?.data?.message || "Failed to load wishlist");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWishlist();
    // cleanup to avoid setting state if unmounted
    return () => { cancelled = true; };
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) =>
        prev.filter((w) => (w.product?._id || w._id) !== productId)
      );
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove from wishlist");
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success("Added to cart");
    // remove it from wishlist after adding
    handleRemove(product._id);
  };

  const handleClear = async () => {
    if (!window.confirm("Clear your entire wishlist?")) return;
    try {
      await axios.delete("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist([]);
      toast.success("Wishlist cleared");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to clear wishlist");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="animate-spin inline-block w-12 h-12 border-4 border-b-transparent rounded-full"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        {wishlist.length > 0 && (
          <button
            onClick={handleClear}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTrash className="mr-1" /> Clear Wishlist
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <FaHeart className="text-gray-300 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-4">
            Add items to your wishlist to keep track of antiques you're interested in.
          </p>
          <Link
            to="/products"
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wishlist.map((item) => {
                const p = item.product || item;
                return (
                  <tr key={p._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={p.images?.[0] || "/placeholder.svg"}
                          alt={p.name}
                          className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="ml-4">
                          <Link
                            to={`/products/${p._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-primary-600"
                          >
                            {p.name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            Seller: {p.seller?.shopName || p.seller?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-medium text-gray-900">
                        ${p.price?.toFixed(2)}
                      </div>
                      {p.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${p.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.isAvailable ? (
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {p.isAvailable && (
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Add to Cart"
                          >
                            <FaShoppingCart />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(p._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove from Wishlist"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
