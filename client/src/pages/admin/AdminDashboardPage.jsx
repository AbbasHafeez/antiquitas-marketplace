// client/src/pages/admin/AdminDashboardPage.jsx
"use client";

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FaUsers,
  FaBoxOpen,
  FaShippingFast,
  FaChartLine,
  FaListAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const AdminDashboardPage = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVerifications: 0,
    activeDisputes: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard statistics
        const { data: statsData } = await axios.get(
          "/api/admin/dashboard/stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(statsData);

        // Fetch recent orders
        const { data: ordersData } = await axios.get(
          "/api/admin/dashboard/recent-orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecentOrders(ordersData);

        // Fetch pending product verifications
        const { data: productsData } = await axios.get(
          "/api/admin/dashboard/pending-products",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingProducts(productsData);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, <span className="font-semibold">{user.name}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: <FaUsers size={24} />,   label: "Total Users",        value: stats.totalUsers,       color: "blue"   },
          { icon: <FaBoxOpen size={24} />,  label: "Total Products",     value: stats.totalProducts,    color: "green"  },
          { icon: <FaShippingFast size={24}/>, label: "Total Orders",     value: stats.totalOrders,      color: "purple" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}
              >
                {icon}
              </div>
              <div>
                <p className="text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: <FaCheckCircle size={24}/>,        label: "Pending Verifications", value: stats.pendingVerifications, color: "yellow" },
          { icon: <FaExclamationTriangle size={24}/>, label: "Active Disputes",      value: stats.activeDisputes,      color: "red"    },
          { icon: <FaChartLine size={24}/>,          label: "Total Revenue",        value: `$${stats.revenue.toFixed(2)}`, color: "indigo" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}
              >
                {icon}
              </div>
              <div>
                <p className="text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No recent orders
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Order ID","Customer","Date","Status","Total"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          #{order._id.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {order.user.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Product Verifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pending Verifications</h2>
            <Link
              to="/admin/products/approval"
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              View All
            </Link>
          </div>
          {pendingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No pending verifications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center border-b pb-4"
                >
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      Seller: {product.seller.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Listed:{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/admin/products/${product._id}`}
                    className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700"
                  >
                    Verify
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <FaUsers className="text-primary-600 text-2xl mb-2" />
            <span className="text-sm">Manage Users</span>
          </Link>
          <Link
            to="/admin/products/approval"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <FaCheckCircle className="text-primary-600 text-2xl mb-2" />
            <span className="text-sm">Verify Products</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <FaListAlt className="text-primary-600 text-2xl mb-2" />
            <span className="text-sm">Manage Categories</span>
          </Link>
          <Link
            to="/admin/disputes"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <FaExclamationTriangle className="text-primary-600 text-2xl mb-2" />
            <span className="text-sm">Resolve Disputes</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
