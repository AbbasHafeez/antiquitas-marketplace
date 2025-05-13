"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaSearch, FaEdit, FaBan, FaCheck, FaUserAlt, FaStore, FaTruck, FaShieldAlt } from "react-icons/fa"
import UserEditModal from "../../components/admin/UserEditModal"

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchUsers = async (page = 1, filters = {}) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...filters,
      })

      const response = await axios.get(`/api/admin/users?${params.toString()}`)
      setUsers(response.data.users)
      setFilteredUsers(response.data.users)
      setTotalPages(response.data.pages)
      setCurrentPage(response.data.page)
      setLoading(false)
    } catch (err) {
      setError("Failed to load users")
      setLoading(false)
      toast.error("Failed to load users")
    }
  }

  useEffect(() => {
    fetchUsers(currentPage, {
      role: roleFilter !== "all" ? roleFilter : "",
      status: statusFilter !== "all" ? statusFilter : "",
    })
  }, [currentPage, roleFilter, statusFilter])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleSearch = (e) => {
    e.preventDefault()
    // The filtering is already handled by the useEffect
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleUpdateUser = async (updatedUser) => {
    try {
      await axios.put(`/api/admin/users/${updatedUser._id}`, updatedUser)

      // Update the user in the local state
      const updatedUsers = users.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      setUsers(updatedUsers)
      setFilteredUsers(filteredUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user)))

      setIsModalOpen(false)
      toast.success("User updated successfully")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user")
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active"
      await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus })

      // Update the user in the local state
      const updatedUsers = users.map((user) => (user._id === userId ? { ...user, status: newStatus } : user))
      setUsers(updatedUsers)
      setFilteredUsers(filteredUsers.map((user) => (user._id === userId ? { ...user, status: newStatus } : user)))

      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status")
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaShieldAlt className="text-red-500" title="Admin" />
      case "seller":
        return <FaStore className="text-green-500" title="Seller" />
      case "shipper":
        return <FaTruck className="text-blue-500" title="Shipper" />
      default:
        return <FaUserAlt className="text-gray-500" title="Buyer" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-40 p-2 border rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="shipper">Shippers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-md"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {user.shopName && <div className="text-xs text-gray-500">Shop: {user.shopName}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "suspended"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.status)}
                          className={`${
                            user.status === "active"
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={user.status === "active" ? "Suspend User" : "Activate User"}
                        >
                          {user.status === "active" ? <FaBan /> : <FaCheck />}
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

      {/* Edit User Modal */}
      {isModalOpen && selectedUser && (
        <UserEditModal user={selectedUser} onClose={() => setIsModalOpen(false)} onSave={handleUpdateUser} />
      )}
    </div>
  )
}

export default UserManagementPage
