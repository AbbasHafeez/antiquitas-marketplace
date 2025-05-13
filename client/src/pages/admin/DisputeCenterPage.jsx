"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaSearch, FaExclamationTriangle, FaEye, FaCheckCircle } from "react-icons/fa"
import DisputeDetailsModal from "../../components/admin/DisputeDetailsModal"

const DisputeCenterPage = () => {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchDisputes()
  }, [currentPage, statusFilter])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await axios.get(`/api/admin/disputes?${params.toString()}`)
      setDisputes(response.data.disputes)
      setTotalPages(response.data.pages)
      setCurrentPage(response.data.page)
      setLoading(false)
    } catch (err) {
      setError("Failed to load disputes")
      setLoading(false)
      toast.error("Failed to load disputes")
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchDisputes()
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleViewDispute = (dispute) => {
    setSelectedDispute(dispute)
    setIsModalOpen(true)
  }

  const handleResolveDispute = async (disputeId, resolution, resolutionDetails) => {
    try {
      await axios.put(`/api/admin/disputes/${disputeId}/resolve`, {
        resolution,
        resolutionDetails,
      })

      toast.success("Dispute resolved successfully")
      setIsModalOpen(false)
      fetchDisputes()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resolve dispute")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "under_review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dispute Center</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full sm:w-40 p-2 border rounded-md"
            >
              <option value="all">All Disputes</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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

      {/* Disputes Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">No disputes found</h2>
          <p className="text-gray-600">There are no disputes matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispute ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raised By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Against
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {disputes.map((dispute) => (
                  <tr key={dispute._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{dispute._id.substring(dispute._id.length - 6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-600">
                        #{dispute.order._id.substring(dispute.order._id.length - 6)}
                      </div>
                      <div className="text-xs text-gray-500">${dispute.order.totalPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dispute.raisedBy.name}</div>
                      <div className="text-xs text-gray-500">{dispute.raisedBy.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dispute.against.name}</div>
                      <div className="text-xs text-gray-500">{dispute.against.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-900 capitalize">{dispute.reason.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          dispute.status,
                        )}`}
                      >
                        {dispute.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(dispute.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDispute(dispute)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
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

      {/* Dispute Details Modal */}
      {isModalOpen && selectedDispute && (
        <DisputeDetailsModal
          dispute={selectedDispute}
          onClose={() => setIsModalOpen(false)}
          onResolve={handleResolveDispute}
        />
      )}
    </div>
  )
}

export default DisputeCenterPage
