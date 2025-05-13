"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../../context/AuthContext"
import { FaShippingFast, FaBoxOpen, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaChartLine } from "react-icons/fa"

const ShipperDashboardPage = () => {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState({
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    deliveryRate: 0,
  })
  const [assignedOrders, setAssignedOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // 1️⃣ Fetch shipper statistics
        const statsResponse = await axios.get("/api/shipper/stats")
        setStats(statsResponse.data)

        // 2️⃣ Fetch assigned orders (limit to 5)
        const ordersResponse = await axios.get("/api/orders/shipper?limit=5")
        const payload = ordersResponse.data

        // If payload is an object with `.orders`, use that.
        // Otherwise assume it's already an array.
        const ordersArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.orders)
          ? payload.orders
          : []

        setAssignedOrders(ordersArray)

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Failed to load dashboard data")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Shipper Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, <span className="font-semibold">{user.name}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaBoxOpen size={24} />
            </div>
            <div>
              <p className="text-gray-500">Pending Deliveries</p>
              <h3 className="text-2xl font-bold">{stats.pendingDeliveries}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaCheckCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500">Completed Deliveries</p>
              <h3 className="text-2xl font-bold">{stats.completedDeliveries}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FaShippingFast size={24} />
            </div>
            <div>
              <p className="text-gray-500">On-Time Rate</p>
              <h3 className="text-2xl font-bold">{stats.deliveryRate}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Orders */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Current Assignments</h2>
          <Link to="/shipper/orders" className="text-primary-600 hover:text-primary-800 text-sm">
            View All
          </Link>
        </div>

        {assignedOrders.length === 0 ? (
          <div className="text-center py-8">
            <FaBoxOpen className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">No orders assigned to you yet.</p>
          </div>
        ) : (
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
                {assignedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/shipper/orders/${order._id}`} className="text-primary-600 hover:text-primary-800">
                        #{order._id.substring(order._id.length - 6)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
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
                      <Link
                        to={`/shipper/orders/${order._id}`}
                        className="text-primary-600 hover:text-primary-800 px-3 py-1 border border-primary-600 rounded-md"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/shipper/orders" className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
              <FaBoxOpen className="text-primary-600 mr-3" />
              <span>View All Assignments</span>
            </Link>
            <Link
              to="/shipper/delivery-history"
              className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <FaCheckCircle className="text-primary-600 mr-3" />
              <span>Delivery History</span>
            </Link>
            <Link to="/shipper/profile" className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
              <FaMapMarkerAlt className="text-primary-600 mr-3" />
              <span>Update Service Areas</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Delivery Tips</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Always confirm the delivery address before heading out.</li>
            <li>Take clear photos as proof of delivery.</li>
            <li>Contact the customer if you're running late or having trouble finding the address.</li>
            <li>Handle antique items with extra care - they are fragile and valuable.</li>
            <li>Update the order status promptly after delivery is complete.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ShipperDashboardPage
