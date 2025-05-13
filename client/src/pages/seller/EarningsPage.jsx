// client/src/pages/seller/EarningsPage.jsx
"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaChartLine,
  FaDownload,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const EarningsPage = () => {
  const { userInfo } = useContext(AuthContext);
  const token = userInfo?.token || "";

  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    monthlyEarnings: [], // for future chart
  });
  const [transactions, setTransactions] = useState([]);
   // for Recent Transactions pagination
  const [currentPage,   setCurrentPage]   = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
// ── NEW: for Earnings Overview pagination ──
  const [overviewPage,  setOverviewPage]  = useState(1);
  const overviewPageSize = 7;  // rows per page in overview

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("month");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
    useEffect(() => {
      const fetchAll = async () => {
        setLoading(true);
        setError("");
    
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        };
    
        try {
          // fetch the most recent transactions for this seller
          // include page & limit
       const txRes = await axios.get(
          `${API_BASE}/api/transactions?page=${currentPage}&limit=10`,
          config
        );
        // server now returns { txns, page, pages }
        const { txns = [], page = 1, pages = 1 } = txRes.data;
        setTotalPages(pages);
        setCurrentPage(page);
    
          // compute metrics from transactions
          const totalEarnings = txns.reduce((sum, t) => sum + t.amount, 0);
          const pendingPayouts = txns
            .filter(t => t.status === "pending")
            .reduce((sum, t) => sum + t.amount, 0);
          const completedPayouts = txns
            .filter(t => t.status === "completed")
            .reduce((sum, t) => sum + t.amount, 0);
    
          setEarnings({
            totalEarnings,
            pendingPayouts,
            completedPayouts,
            monthlyEarnings: [], // hook up chart data here when ready
          });
          setTransactions(txns);
        } catch (err) {
          console.error("EarningsPage error:", err);
          setError("Failed to load earnings data");
          toast.error("Failed to load earnings data");
        } finally {
          setLoading(false);
        }
      };
    
      fetchAll();
    }, [token, API_BASE, timeframe, currentPage]);

    const filteredTxns = useMemo(() => {
      if (!transactions.length) return [];
      const now = Date.now();
      let cutoff = now;
      if (timeframe === "week")  cutoff = now - 7*24*60*60*1000;
      if (timeframe === "month") cutoff = now - 30*24*60*60*1000;
      if (timeframe === "year")  cutoff = now - 365*24*60*60*1000;
      return transactions.filter(t => {
        const d = new Date(t.date || t.createdAt).getTime();
        return d >= cutoff;
      });
    }, [transactions, timeframe]);
    
  // ── slice filteredTxns for the Overview table ──
    const overviewPaged = useMemo(() => {
    const start = (overviewPage - 1) * overviewPageSize;
    return filteredTxns.slice(start, start + overviewPageSize);
  }, [filteredTxns, overviewPage]);


    // ── client‐side pagination for the "Recent Transactions" table ──
   const itemsPerPage = 10;
   const pagedTransactions = useMemo(() => {
     const start = (currentPage - 1) * itemsPerPage;
     return transactions.slice(start, start + itemsPerPage);
   }, [transactions, currentPage]);


    function handleDownloadPDF() {
      const doc = new jsPDF();
      // use the imported function rather than doc.autoTable:
      autoTable(doc, {
        head: [[ "ID", "Date", "Description", "Amount", "Status" ]],
        body: filteredTxns.map(t=>[
          `#${t.order.toString().slice(-6)}`,
          new Date(t.date||t.createdAt).toLocaleDateString(),
          "Sale payout",
          `$${Number(t.amount).toFixed(2)}`,
          t.status.charAt(0).toUpperCase()+t.status.slice(1)
        ])
      });
      doc.save("transactions.pdf");
    }
  const statusClass = (s) =>
    ({
      delivered: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    }[s] || "bg-gray-100 text-gray-800");

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-t-primary-600 rounded-full" />
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Earnings &amp; Payouts</h1>

      {/* ── Stats Cards ── */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          { label: "Total Earnings", value: earnings.totalEarnings },
          { label: "Pending Payouts", value: earnings.pendingPayouts },
          { label: "Completed Payouts", value: earnings.completedPayouts },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white p-6 rounded-lg shadow flex items-center"
          >
            <div className="p-3 bg-gray-100 rounded-full mr-4">
              <FaMoneyBillWave size={24} />
            </div>
            <div>
              <p className="text-gray-500">{label}</p>
              <h2 className="text-2xl font-bold">${value.toFixed(2)}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ── Earnings Overview  ── */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">Earnings Overview</h2>
    <div className="flex items-center">
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        className="border p-2 rounded mr-2"
      >
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="year">Last 12 Months</option>
      </select>
      <button onClick={handleDownloadPDF} className="p-2 hover:bg-gray-100 rounded">
        <FaDownload />
      </button>
    </div>
  </div>

  {overviewPaged.length ? (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["ID","Date","Amount","Status"].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {overviewPaged.map(t => {
            const dateStr = new Date(t.date||t.createdAt).toLocaleDateString();
            return (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  #{String(t.order).slice(-6)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <FaCalendarAlt className="inline mr-1"/> {dateStr}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${Number(t.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                    t.status==="completed"?"bg-green-100 text-green-800":
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {t.status.charAt(0).toUpperCase()+t.status.slice(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-center text-gray-500 py-12">
      No earnings data found for the selected period
    </p>
  )}
</div>
      {/* ── Overview Pagination Controls ── */}
      {Math.ceil(filteredTxns.length/overviewPageSize) > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={() => setOverviewPage(p => Math.max(1, p - 1))}
            disabled={overviewPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {overviewPage} of {Math.ceil(filteredTxns.length/overviewPageSize)}
          </span>
          <button
            onClick={() => setOverviewPage(p => Math.min(Math.ceil(filteredTxns.length/overviewPageSize), p + 1))}
            disabled={overviewPage === Math.ceil(filteredTxns.length/overviewPageSize)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Recent Transactions ── */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No transactions found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "Date", "Description", "Amount", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {pagedTransactions.map((t) => {
                   // now use t.order, t.date (or fallback to t.createdAt), and t.status
                  const displayId = t.order
                    ? `#${t.order.toString().slice(-6)}`
                    : "#";
                  const dateValue = t.date || t.createdAt;
                  const dateStr = dateValue
                    ? new Date(dateValue).toLocaleDateString()
                    : "—";
                  const amt    = Number(t.amount) || 0;
                 const status = t.status || "pending"; 

                  return (
                    <tr
                      key={t.orderId || Math.random()}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {displayId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <FaCalendarAlt className="inline mr-1" />
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        Sale payout
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${amt.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs font-semibold rounded-full ${statusClass(
                            status
                          )}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* ── Pagination Controls ── */}
     {totalPages > 1 && (
       <div className="flex justify-center items-center mt-4 space-x-4">
         <button
           onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
           disabled={currentPage === 1}
           className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
         >
           Previous
         </button>
         <span>
           Page {currentPage} of {totalPages}
         </span>
         <button
           onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
           disabled={currentPage === totalPages}
           className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
         >
           Next
         </button>
       </div>
     )}
    </div>
  );
};

export default EarningsPage;
