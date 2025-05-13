"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaEdit, FaTrash, FaPlus, FaTruck, FaMapMarkerAlt } from "react-icons/fa"

const ShipmentPartnersPage = () => {
  const [shippers, setShippers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShipper, setSelectedShipper] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceAreas: "",
    status: "active",
  })

  useEffect(() => {
    fetchShippers()
  }, [])

  const fetchShippers = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/shipment/shippers")
      setShippers(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to load shipment partners")
      setLoading(false)
      toast.error("Failed to load shipment partners")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleOpenModal = (shipper = null) => {
    if (shipper) {
      setSelectedShipper(shipper)
      setFormData({
        name: shipper.name,
        email: shipper.email,
        phone: shipper.phone || "",
        company: shipper.company || "",
        serviceAreas: shipper.serviceAreas ? shipper.serviceAreas.join(", ") : "",
        status: shipper.status || "active",
      })
    } else {
      setSelectedShipper(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        serviceAreas: "",
        status: "active",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const shipperData = {
        ...formData,
        serviceAreas: formData.serviceAreas
          .split(",")
          .map((area) => area.trim())
          .filter(Boolean),
        role: "shipper",
      }

      if (selectedShipper) {
        // Update existing shipper
        await axios.put(`/api/admin/users/${selectedShipper._id}`, shipperData)
        toast.success("Shipment partner updated successfully")
      } else {
        // Create new shipper
        await axios.post("/api/admin/users", shipperData)
        toast.success("Shipment partner added successfully")
      }

      fetchShippers()
      handleCloseModal()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save shipment partner")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteShipper = async (shipperId) => {
    if (window.confirm("Are you sure you want to delete this shipment partner?")) {
      try {
        await axios.delete(`/api/admin/users/${shipperId}`)
        toast.success("Shipment partner deleted successfully")
        fetchShippers()
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete shipment partner")
      }
    }
  }

  const handleToggleStatus = async (shipper) => {
    try {
      const newStatus = shipper.status === "active" ? "suspended" : "active"
      await axios.put(`/api/admin/users/${shipper._id}/status`, { status: newStatus })

      toast.success(`Shipment partner ${newStatus === "active" ? "activated" : "suspended"} successfully`)
      fetchShippers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shipment Partners</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Add Partner
        </button>
      </div>

      {loading && !shippers.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : shippers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaTruck className="mx-auto text-gray-300 text-6xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">No shipment partners found</h2>
          <p className="text-gray-600 mb-6">Add your first shipment partner to start managing deliveries.</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Add Shipment Partner
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Areas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shippers.map((shipper) => (
                  <tr key={shipper._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <FaTruck className="text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{shipper.name}</div>
                          <div className="text-sm text-gray-500">{shipper.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipper.email}</div>
                      <div className="text-sm text-gray-500">{shipper.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {shipper.serviceAreas &&
                          shipper.serviceAreas.map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <FaMapMarkerAlt className="mr-1" />
                              {area}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          shipper.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {shipper.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(shipper)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(shipper)}
                        className={`mr-3 ${
                          shipper.status === "active"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {shipper.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteShipper(shipper._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Shipper Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {selectedShipper ? "Edit Shipment Partner" : "Add Shipment Partner"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={selectedShipper}
                  />
                  {selectedShipper && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="serviceAreas" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Areas (comma separated)
                  </label>
                  <input
                    type="text"
                    id="serviceAreas"
                    name="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShipmentPartnersPage
