"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaShoppingBag, FaSearch } from "react-icons/fa";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Order History – Customer view                                            */
/* ────────────────────────────────────────────────────────────────────────── */
const OrderHistoryPage = () => {
  const [orders, setOrders]             = useState([]);   // ← always an array
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchTerm, setSearchTerm]     = useState("");

  /* ── fetch once on mount ── */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get("/api/orders/myorders");

        /* normalise backend response */
        const arrayData = Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data)
          ? data
          : [];

        setOrders(arrayData);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ── derived list based on search ── */
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (!searchTerm.trim())     return orders;

    const term = searchTerm.trim().toLowerCase();
    return orders.filter((o) => o._id?.toLowerCase().includes(term));
  }, [orders, searchTerm]);

  /* ── helpers ── */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped":   return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default:          return "bg-yellow-100 text-yellow-800";
    }
  };

  /* ───────────────────────── render ───────────────────────── */
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {/* search box */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by order ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* states */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaShoppingBag className="mx-auto text-gray-300 text-6xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Antiques
          </Link>
        </div>
      ) : (
        /* table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID","Date","Total","Status",""]
                  .map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${h===""&&"text-right"}`}
                    >
                      {h || "Actions"}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{o._id?.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${o.totalPrice?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs rounded-full ${getStatusBadgeClass(o.status)}`}>
                      {o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/orders/${o._id}`} className="text-primary-600 hover:text-primary-900">
                      <FaEye className="inline mr-1" /> View
                    </Link>
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

export default OrderHistoryPage;
