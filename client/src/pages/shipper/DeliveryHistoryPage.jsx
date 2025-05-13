"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle } from "react-icons/fa"

const DeliveryHistoryPage = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchDeliveries = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
        status: "delivered", // Only get delivered orders
      })

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      if (dateFilter !== "all") {
        const today = new Date()
        let startDate

        switch (dateFilter) {
          case "today":
            startDate = new Date(today.setHours(0, 0, 0, 0))
            break
          case "week":
            startDate = new Date(today.setDate(today.getDate() - 7))
            break
          case "month":
            startDate = new Date(today.setMonth(today.getMonth() - 1))
            break
          default:
            startDate = null
        }

        if (startDate) {
          params.append("startDate", startDate.toISOString())
        }
      }

      const response = await axios.get(`/api/orders/shipper?${params.toString()}`)
      setDeliveries(response.data.orders || response.data) // Handle different API response formats

      if (response.data.pages) {
        setTotalPages(response.data.pages)
        setCurrentPage(response.data.page)
      }

      setLoading(false)
    } catch (err) {
      setError("Failed to load delivery history")
      setLoading(false)
      toast.error("Failed to load delivery history")
    }
  }

  useEffect(() => {
    fetchDeliveries(currentPage)
  }, [currentPage, dateFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchDeliveries(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Delivery History</h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-40 p-2 border rounded-md"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
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

      {/* Deliveries Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No delivery history found matching your criteria.</p>
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
                    Delivered Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proof
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/shipper/orders/${delivery._id}`} className="text-primary-600 hover:text-primary-800">
                        #{delivery._id.substring(delivery._id.length - 6)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{delivery.user.name}</div>
                      <div className="text-xs text-gray-500">{delivery.shippingAddress.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        <div className="text-sm text-gray-900">
                          {delivery.shippingAddress.city}, {delivery.shippingAddress.state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2" />
                        {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {delivery.deliveryProof ? (
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">Available</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/shipper/orders/${delivery._id}`}
                        className="text-primary-600 hover:text-primary-800 px-3 py-1 border border-primary-600 rounded-md"
                      >
                        View Details
                      </Link>
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
    </div>
  )
}

export default DeliveryHistoryPage
