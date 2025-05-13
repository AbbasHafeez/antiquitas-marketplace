// client/src/pages/admin/AdminOrdersPage.jsx
"use client";

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function AdminOrdersPage() {
  const { token } = useContext(AuthContext);

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm]   = useState("");
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ page, limit: 10 });
        if (statusFilter) params.append("status", statusFilter);
        if (searchTerm)   params.append("search", searchTerm);

        // ⚠️ Use the admin route here
        const { data } = await axios.get(
          `/api/admin/orders?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrders(data.orders);
        setPage(data.page);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, page, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search Order ID or Customer…"
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID","Customer","Date","Status","Total"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link
                      to={`/admin/orders/${o._id}`}
                      className="text-primary-600 hover:underline"
                    >
                      #{o._id.slice(-6)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{o.user.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        o.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : o.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : o.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    ${o.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-3 py-1 rounded ${
            page === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary-600 text-white hover:bg-primary-700"
          }`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
          className={`px-3 py-1 rounded ${
            page === pages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary-600 text-white hover:bg-primary-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
