"use client"

import React, { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaBox, FaTruck, FaCheckCircle } from "react-icons/fa"
import UpdateDeliveryStatusModal from "../../components/shipper/UpdateDeliveryStatusModal"

const AssignedOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { userInfo } = useContext(AuthContext);
  const token        = userInfo?.token || "";

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await axios.get(`/api/orders/shipper?${params.toString()}`)
      setOrders(response.data.orders || response.data) // Handle different API response formats

      if (response.data.pages) {
        setTotalPages(response.data.pages)
        setCurrentPage(response.data.page)
      }

      setLoading(false)
    } catch (err) {
      setError("Failed to load orders")
      setLoading(false)
      toast.error("Failed to load orders")
    }
  }

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage, statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchOrders(1)
  }
 // ← INSERT *THIS* WHOLE FUNCTION inside the component:
 const handleUpdateStatus = async (orderId, newStatus, deliveryProof = null) => {
  try {
    if (newStatus === "delivered" && deliveryProof) {
      // 1) Upload the proof under the exact field name "proofImage"
      const formData = new FormData();
      formData.append("proofImage", deliveryProof);

      const uploadResponse = await axios.post(
        "/api/upload/proof",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const proofImageUrl = uploadResponse.data.file; // "/uploads/proofs/XYZ.jpg"

      // 2) Now mark delivered
      await axios.put(
        `/api/orders/${orderId}/delivery-proof`,
        { proofImage: proofImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // Just update status (processing → shipped, etc.)
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // 3) Update local state & UI
    setOrders(prev =>
      prev.map(o =>
        o._id === orderId ? { ...o, status: newStatus } : o
      )
    );
    setIsModalOpen(false);
    toast.success(`Order status updated to ${newStatus}`);

    // 4) If you have a status filter active, re-fetch
    if (statusFilter !== "all") fetchOrders(currentPage);
  } catch (err) {
    console.error("handleUpdateStatus error:", err);
    toast.error(err.response?.data?.message || "Failed to update order");
  }
};
// ← END handleUpdateStatus

  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <FaBox className="text-yellow-500" />
      case "shipped":
        return <FaTruck className="text-blue-500" />
      case "delivered":
        return <FaCheckCircle className="text-green-500" />
      default:
        return <FaBox className="text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Assigned Orders</h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 p-2 border rounded-md"
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by order ID or customer name..."
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

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Delivery
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/shipper/orders/${order._id}`} className="text-primary-600 hover:text-primary-800">
                        #{order._id.substring(order._id.length - 6)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-xs text-gray-500">{order.shippingAddress.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        <div className="text-sm text-gray-900">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2" />
                        {order.shipment?.estimatedDelivery
                          ? new Date(order.shipment.estimatedDelivery).toLocaleDateString()
                          : "Not set"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/shipper/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openStatusModal(order)}
                          className="text-primary-600 hover:text-primary-800 px-2 py-1 border border-primary-600 rounded-md"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

      {/* Update Status Modal */}
      {isModalOpen && selectedOrder && (
        <UpdateDeliveryStatusModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={(status, deliveryProof) => handleUpdateStatus(selectedOrder._id, status, deliveryProof)}
        />
      )}
    </div>
  )
}

export default AssignedOrdersPage
