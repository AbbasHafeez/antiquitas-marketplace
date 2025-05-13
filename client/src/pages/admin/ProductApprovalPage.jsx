// client/src/pages/admin/ProductApprovalPage.jsx
"use client";

import { useState, useEffect } from "react";
import { Link }               from "react-router-dom";
import axios                  from "axios";
import { toast }              from "react-toastify";
import { FaSearch, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import ProductVerificationModal from "../../components/admin/ProductVerificationModal";

const ProductApprovalPage = () => {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        verified: "false", // Only unverified
      });
      if (searchTerm) params.append("search", searchTerm);

      const res = await axios.get(
        `/api/admin/products/pending?${params.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setProducts(res.data.products);
      setTotalPages(res.data.pages);
      setCurrentPage(res.data.page);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const openVerificationModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleVerifyProduct = async (productId, isApproved, rejectionReason = "") => {
    try {
      if (isApproved) {
        await axios.put(
          `/api/admin/products/${productId}/verify`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Product verified successfully");
      } else {
        await axios.put(
          `/api/admin/products/${productId}/reject`,
          { reason: rejectionReason },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.info("Product rejected successfully");
      }

      // Remove from list
      setProducts((p) => p.filter((x) => x._id !== productId));
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update product status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Product Verification</h1>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border rounded-md"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-4 text-white bg-primary-600 rounded-r-md hover:bg-primary-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No products pending verification.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listed Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">Age: {product.age} years</div>
                        <div className="text-xs text-gray-500">Origin: {product.origin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.seller.name}</div>
                    {product.seller.shopName && <div className="text-xs text-gray-500">{product.seller.shopName}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      {/* 👁️ Admin detail page */}
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      {/* open modal for approve/reject */}
                      <button
                        onClick={() => openVerificationModal(product)}
                        className="text-green-600 hover:text-green-800"
                        title="Verify/Reject"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => openVerificationModal(product)}
                        className="text-red-600 hover:text-red-800"
                        title="Verify/Reject"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary-600 text-white hover:bg-primary-700"}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary-600 text-white hover:bg-primary-700"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verify/Reject Modal */}
      {isModalOpen && selectedProduct && (
        <ProductVerificationModal
          product={selectedProduct}
          onClose={() => setIsModalOpen(false)}
          onVerify={(approved, reason) =>
            handleVerifyProduct(selectedProduct._id, approved, reason)
          }
        />
      )}
    </div>
  );
};

export default ProductApprovalPage;
