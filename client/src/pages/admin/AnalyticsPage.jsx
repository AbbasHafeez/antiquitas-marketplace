"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaChartLine, FaDownload, FaUsers, FaShoppingCart, FaMoneyBillWave, FaStore } from "react-icons/fa"

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    salesByCategory: [],
    salesByMonth: [],
    topSellingProducts: [],
    topSellers: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState("month")

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/admin/analytics?timeframe=${timeframe}`)
        setStats(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load analytics data")
        setLoading(false)
        toast.error("Failed to load analytics data")
      }
    }

    fetchAnalyticsData()
  }, [timeframe])

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value)
  }

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        <div className="flex items-center">
          <select value={timeframe} onChange={handleTimeframeChange} className="mr-2 p-2 border rounded-md">
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
          <button className="bg-gray-100 p-2 rounded-md hover:bg-gray-200">
            <FaDownload className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaShoppingCart size={24} />
            </div>
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FaMoneyBillWave size={24} />
            </div>
            <div>
              <p className="text-gray-500">Avg. Order Value</p>
              <h3 className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <FaChartLine className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">Sales chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Top Products and Top Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          {stats.topSellingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-4">
              {stats.topSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center border-b pb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-md mr-4"></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${product.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{product.sold} sold</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Top Sellers</h2>
          {stats.topSellers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-4">
              {stats.topSellers.map((seller, index) => (
                <div key={index} className="flex items-center border-b pb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{seller.name}</h3>
                    <p className="text-sm text-gray-500">{seller.shopName}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${seller.sales.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{seller.products} products</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales by Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <FaStore className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500">Category chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
