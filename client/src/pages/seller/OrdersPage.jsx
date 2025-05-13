"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [selectedShippers, setSelectedShippers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // ─── fetch shippers once ────────────────────────────────────────
  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const { data } = await axios.get("/api/shipment/available"); // ✅ fixed endpoint
        setShippers(data);
      } catch (err) {
        console.error("Failed to load shippers", err);
        toast.error("Failed to load shippers");
      }
    };
    fetchShippers();
  }, []);

  // ─── fetch orders on filter/page change ─────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ page: currentPage, limit: 10 });
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());

        const { data } = await axios.get(`/api/orders/seller?${params.toString()}`);

        let ordersArr = [];
        let pagesTotal = 1;
        if (Array.isArray(data.orders)) {
          ordersArr = data.orders;
          pagesTotal = data.pages || 1;
        } else if (Array.isArray(data)) {
          ordersArr = data;
        }

        setOrders(ordersArr);
        setTotalPages(pagesTotal);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const refresh = () => {
    setCurrentPage((p) => p);
  };

  const updateStatus = async (orderId, status, cancelReason) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status,
        ...(cancelReason && { cancelReason }),
      });
      toast.success(`Order ${status}`);
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleConfirm = (orderId) => updateStatus(orderId, "processing");
  const handleCancel = (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    updateStatus(orderId, "cancelled", "Cancelled by seller");
  };

  const handleAssign = async (orderId) => {
    const shipperId = selectedShippers[orderId];
    if (!shipperId) {
      toast.error("Select a shipper first");
      return;
    }
    try {
      await axios.put(`/api/orders/${orderId}/assign`, { shipperId });
      toast.success("Assigned to shipper");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      <button
        className="md:hidden flex items-center bg-primary-600 text-white px-4 py-2 rounded-md mb-4"
        onClick={() => setShowFilters((s) => !s)}
      >
        {showFilters ? (
          <>
            <FaTimes className="mr-2" /> Hide Filters
          </>
        ) : (
          <>
            <FaFilter className="mr-2" /> Show Filters
          </>
        )}
      </button>

      <div
        className={`bg-white rounded-lg shadow-md p-6 mb-6 ${showFilters ? "block" : "hidden md:block"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full sm:w-40 p-2 border rounded-md"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by ID or customer..."
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Order ID", "Customer", "Date", "Status", "Items", "Total", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        h === "Actions" && "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderItems?.length ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-sm font-medium">
                      {/* View */}
                      <Link
                        to={`/seller/orders/${order._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FaEye className="inline mr-1" /> View
                      </Link>

                      {/* Confirm / Cancel */}
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleConfirm(order._id)}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancel(order._id)}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Assign to Shipper */}
                      {order.status === "processing" && (
                        <>
                          <select
                            value={selectedShippers[order._id] || ""}
                            onChange={(e) =>
                              setSelectedShippers((prev) => ({
                                ...prev,
                                [order._id]: e.target.value,
                              }))
                            }
                            className="p-1 border rounded"
                          >
                            <option value="">Select Shipper</option>
                            {shippers.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(order._id)}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                          >
                            Assign
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
