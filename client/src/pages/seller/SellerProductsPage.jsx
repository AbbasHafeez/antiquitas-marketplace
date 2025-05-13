"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaSpinner,
  FaBoxOpen,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

/* tiny helper so we never crash if API gives non-array */
const toArray = (d) => (Array.isArray(d) ? d : []);

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ───────── fetch once ───────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/products/seller");
        setProducts(toArray(data));
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load your products"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts((p) => p.filter((i) => i._id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ───────── render ───────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          to="/seller/products/add"
          className="bg-primary-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-primary-700"
        >
          <FaPlus className="mr-2" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <FaBoxOpen className="mx-auto text-gray-300 text-6xl mb-4" />
          <h3 className="text-lg text-gray-500">You have no products yet</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {["Photo", "Name", "Price", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <img
                      src={p.images?.[0] || "/placeholder.svg"}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">{p.name}</td>
                  <td className="px-6 py-3">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    {p.isVerified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-3 space-x-3">
                    <Link
                      to={`/seller/products/edit/${p._id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
