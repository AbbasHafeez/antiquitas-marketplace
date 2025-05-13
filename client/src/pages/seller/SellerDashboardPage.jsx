"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaPlus,
} from "react-icons/fa";
 import {
     Chart as ChartJS,
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     BarElement,
     ArcElement,
     Title,
     Tooltip,
     Legend
   } from 'chart.js';
   import { Line, Pie, Bar } from 'react-chartjs-2';
  
   ChartJS.register(
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     BarElement,
     ArcElement,
     Title,
     Tooltip,
     Legend
   );

/* convert anything → [] to avoid “.map is not a function” */
const toArray = (d) => (Array.isArray(d) ? d : []);

/* tailwind colours you actually use so the classes are kept after build */
const colourClass = {
  blue:   "bg-blue-100 text-blue-600",
  yellow: "bg-yellow-100 text-yellow-600",
  green:  "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

const SellerDashboardPage = () => {
  const { user } = useContext(AuthContext);

  /* ───────── state ───────── */
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [monthlyEarnings, setMonthlyEarnings] = useState([]);    // e.g. [{ month: 'Mar', earnings: 1234 }, …]
 const [orderStatusCounts, setOrderStatusCounts] = useState({}); // { delivered: 5, cancelled: 2, … }
 const [topProductSales, setTopProductSales] = useState([]);    // e.g. [{ name: 'Vase', sold: 12 }, …]

  /* ───────── fetch once on mount ───────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: statRes } = await axios.get("/api/seller/stats");
        setStats(statRes);
        setMonthlyEarnings(statRes.monthlyEarnings || []);
         // pull out the `orders` array from the { orders, pages } response
     const { data: orderRes } = await axios.get(
          "/api/orders/seller?limit=5"
       );
       setRecentOrders(orderRes.orders);
            // count statuses
            const counts = orderRes.orders.reduce((acc, o) => {
              acc[o.status] = (acc[o.status] || 0) + 1;
              return acc;
            }, {});
            setOrderStatusCounts(counts);
  

        const { data: prodRes } = await axios.get("/api/seller/top-products");
        const tops = toArray(prodRes).map(p => ({
                 name: p.name,
                 sold: p.totalSold || 0
               }));
               setTopProducts(toArray(prodRes));
               setTopProductSales(tops);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    })();
  }, []);

  /* ───────── loading / error ───────── */
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

  /* ───────── UI ───────── */
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back,&nbsp;
          <span className="font-semibold">{user.name}</span>
        </div>
      </div>

      {/* ===== stats cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Products",
            value: stats.totalProducts,
            icon: FaBoxOpen,
            colour: "blue",
          },
          {
            label: "Pending Approval",
            value: stats.pendingProducts,
            icon: FaBoxOpen,
            colour: "yellow",
          },
          {
            label: "Total Orders",
            value: stats.totalOrders,
            icon: FaShoppingCart,
            colour: "green",
          },
          {
            label: "Total Earnings",
            value: `$${stats.totalEarnings.toFixed(2)}`,
            icon: FaMoneyBillWave,
            colour: "purple",
          },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full ${colourClass[colour]} mr-4`}
              >
                <Icon size={24} />
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
        {/* ===== recent orders ===== */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              to="/seller/orders"
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
                    {["Order ID", "Customer", "Date", "Status", "Total"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          to={`/seller/orders/${o._id}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          #{o._id.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {o.user?.name || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            o.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : o.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : o.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {o.status?.charAt(0).toUpperCase() +
                            o.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        ${o.totalPrice?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== top products ===== */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link
              to="/seller/products"
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              View All
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <FaBoxOpen className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500 mb-4">
                You don't have any products yet
              </p>
              <Link
                to="/seller/products/add"
                className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 inline-flex items-center"
              >
                <FaPlus className="mr-2" /> Add Product
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p) => (
                <div key={p._id} className="flex items-center border-b pb-4">
                  <img
                    src={p.images?.[0] || "/img/placeholder.svg"}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-sm text-gray-500">
                      {p.isVerified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-yellow-600">
                          Pending Verification
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${p.price?.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      {p.totalSold || 0} sold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== sales chart placeholder ===== */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
       <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

         {/* Line chart: monthly earnings */}
         <div>
           <h3 className="text-sm mb-2">Monthly Earnings</h3>
           <div className="h-48">
             <Line
               data={{
                 labels: monthlyEarnings.map(e => e.month),
                 datasets: [{
                   label: 'Earnings ($)',
                   data: monthlyEarnings.map(e => e.earnings),
                   borderColor: '#A36F4C',            // antique-gold brown
                   backgroundColor: 'rgba(163,111,76,0.2)',
                   pointBackgroundColor: '#A36F4C',
                   pointBorderColor: '#fff',
                   pointHoverBackgroundColor: '#fff',
                   pointHoverBorderColor: '#A36F4C',
                 }]
               }}
               options={{
                maintainAspectRatio: false,
                 scales: {
                   x: { 
                     ticks: { color: '#4A4A4A' } 
                   },
                   y: { 
                     ticks: { color: '#4A4A4A' },
                     grid: { color: '#E5E7EB' }
                   }
                 },
                 plugins: {
                   legend: {
                     labels: { color: '#4A4A4A' }
                   }
                 }
              }}
             />
           </div>
         </div>

         {/* Pie chart: order status distribution */}
         <div>
           <h3 className="text-sm mb-2">Order Status</h3>
           <div className="h-48">
             <Pie
               data={{
                 labels: Object.keys(orderStatusCounts),
                 datasets: [{
                   data: Object.values(orderStatusCounts),
                   label: 'Orders',
                   backgroundColor: [
                                         '#10B981', // delivered: green
                                         '#EF4444', // cancelled: red
                                         '#3B82F6', // shipped: blue
                                         '#FBBF24'  // pending: yellow
                                       ],
                                       borderColor: '#fff',
                                       borderWidth: 2,
                 }]
               }}
               options={{  maintainAspectRatio: false,
                                 plugins: {
                                   legend: {
                                     position: 'bottom',
                                     labels: { color: '#4A4A4A' }
                                   }
                                 }
                                }}
             />
           </div>
         </div>

         {/* Bar chart: top-product sales */}
         <div>
           <h3 className="text-sm mb-2">Top Products</h3>
           <div className="h-48">
             <Bar
               data={{
                 labels: topProductSales.map(p => p.name),
                 datasets: [{
                   label: 'Units Sold',
                   data: topProductSales.map(p => p.sold),
                   backgroundColor: '#A36F4C',
                   borderColor: '#7A4E2A',
                   borderWidth: 1,
                 }]
               }}
               options={{
                indexAxis: 'y',
                maintainAspectRatio: false,
                 scales: {
                   x: { 
                     ticks: { color: '#4A4A4A' },
                     grid: { color: '#E5E7EB' }
                   },
                   y: {
                     ticks: { color: '#4A4A4A' }
                   }
                 },
                 plugins: {
                   legend: {
                     labels: { color: '#4A4A4A' }
                   }
                 }
              }}
             />
           </div>
         </div>

       </div>
     </div>
    </div>
  );
};

export default SellerDashboardPage;
