"use client"

import { useState } from "react"
import { FaTimes } from "react-icons/fa"

const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    phone: user.phone || "",
    address: {
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      postalCode: user.address?.postalCode || "",
      country: user.address?.country || "",
    },
    shopName: user.shopName || "",
    shopDescription: user.shopDescription || "",
    company: user.company || "",
    serviceAreas: user.serviceAreas?.join(", ") || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Format service areas back to array
    const updatedUser = {
      ...user,
      ...formData,
      serviceAreas: formData.serviceAreas ? formData.serviceAreas.split(",").map((area) => area.trim()) : [],
    }

    onSave(updatedUser)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="shipper">Shipper</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="isVerified" className="block text-sm font-medium text-gray-700 mb-1">
                Email Verification
              </label>
              <select
                id="isVerified"
                name="isVerified"
                value={formData.isVerified}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value={true}>Verified</option>
                <option value={false}>Not Verified</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {formData.role === "seller" && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Seller Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Description
                  </label>
                  <textarea
                    id="shopDescription"
                    name="shopDescription"
                    value={formData.shopDescription}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {formData.role === "shipper" && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Shipper Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. New York, Los Angeles, Chicago"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserEditModal
