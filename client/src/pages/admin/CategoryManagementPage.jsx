"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaFolder } from "react-icons/fa"

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parent: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/categories")
      setCategories(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to load categories")
      setLoading(false)
      toast.error("Failed to load categories")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category)
      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        parent: category.parent || "",
      })
    } else {
      setSelectedCategory(null)
      setFormData({
        name: "",
        description: "",
        image: "",
        parent: "",
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

      if (selectedCategory) {
        // Update existing category
        await axios.put(`/api/categories/${selectedCategory._id}`, formData)
        toast.success("Category updated successfully")
      } else {
        // Create new category
        await axios.post("/api/categories", formData)
        toast.success("Category added successfully")
      }

      fetchCategories()
      handleCloseModal()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`/api/categories/${categoryId}`)
        toast.success("Category deleted successfully")
        fetchCategories()
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete category")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Add Category
        </button>
      </div>

      {loading && !categories.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaFolder className="mx-auto text-gray-300 text-6xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">No categories found</h2>
          <p className="text-gray-600 mb-6">Add your first category to start organizing products.</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image ? (
                          <img
                            src={category.image || "/placeholder.svg"}
                            alt={category.name}
                            className="h-10 w-10 rounded-md object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center mr-3">
                            <FaFolder className="text-primary-600" />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {category.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.parent
                          ? categories.find((c) => c._id === category.parent)?.name || "Unknown"
                          : "None"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.productCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
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

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">{selectedCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name*
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    id="parent"
                    name="parent"
                    value={formData.parent}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter((c) => c._id !== selectedCategory?._id)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
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

export default CategoryManagementPage
