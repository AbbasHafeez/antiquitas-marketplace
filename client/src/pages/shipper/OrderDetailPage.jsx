// client/src/pages/shipper/OrderDetailPage.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaCalendarAlt,
  FaBarcode,
  FaUpload,
} from "react-icons/fa";
import UpdateDeliveryStatusModal from "../../components/shipper/UpdateDeliveryStatusModal";

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError("Failed to load order details");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus, deliveryProofUrl = null) => {
    try {
      let updatedOrder;
  
      if (newStatus === "delivered" && deliveryProofUrl) {
        // ✅ 1) Update order with delivery proof
        const res = await axios.put(`/api/shipper/orders/${id}/delivery-proof`, {
          proofImage: deliveryProofUrl,
        });
        updatedOrder = res.data;
      } else {
        // ✅ 2) Just update status (for shipped etc)
        const res = await axios.put(`/api/shipper/orders/${id}/status`, {
          status: newStatus,
        });
        updatedOrder = res.data;
      }
  
      setOrder(updatedOrder);
      setIsModalOpen(false);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  };
  

  const getStatusStep = (status) => {
    if (status === "processing") return 1;
    if (status === "shipped") return 2;
    if (status === "delivered") return 3;
    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || "Order not found"}
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/shipper/orders"
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Order #{order._id.slice(-6)}
        </h1>
        <div className="flex items-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "shipped"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Delivery Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Delivery Progress
        </h2>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            {[{ icon: FaBox, label: "Processing" },
              { icon: FaTruck, label: "Shipped" },
              { icon: FaCheckCircle, label: "Delivered" }].map(
              ({ icon: Icon, label }, idx) => (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > idx
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon />
                  </div>
                  <span className="text-sm mt-1">{label}</span>
                </div>
              )
            )}
          </div>
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div
              className="h-full bg-primary-600"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Order Date */}
          <div className="border rounded-md p-4">
            <div className="flex items-center text-gray-700 mb-2">
              <FaCalendarAlt className="mr-2" />
              <span className="font-medium">Order Date</span>
            </div>
            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          {/* Tracking Number */}
          <div className="border rounded-md p-4">
            <div className="flex items-center text-gray-700 mb-2">
              <FaBarcode className="mr-2" />
              <span className="font-medium">Tracking #</span>
            </div>
            <p>{order.shipment?.trackingNumber || "Not assigned yet"}</p>
          </div>
          {/* Estimated Delivery */}
          <div className="border rounded-md p-4">
            <div className="flex items-center text-gray-700 mb-2">
              <FaCalendarAlt className="mr-2" />
              <span className="font-medium">Est. Delivery</span>
            </div>
            <p>
              {order.shipment?.estimatedDelivery
                ? new Date(order.shipment.estimatedDelivery).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Customer Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <FaUser className="text-gray-500 mt-1 mr-3" />
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm text-gray-500">
                  {order.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FaPhone className="text-gray-500 mt-1 mr-3" />
              <div>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Shipping Address
          </h2>
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-red-500 mt-1 mr-3" />
            <div>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Delivery Proof */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Delivery Proof
          </h2>
          {order.deliveryProof ? (
            <>
              <img
                src={order.deliveryProof}
                alt="Delivery proof"
                className="w-full h-40 object-cover rounded-md"
              />
              <p className="text-sm text-gray-500 mt-2">
                Delivered on:{" "}
                {order.deliveredAt
                  ? new Date(order.deliveredAt).toLocaleString()
                  : "N/A"}
              </p>
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500">
                No delivery proof uploaded yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Update the order status to “Delivered” to upload proof
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Order Items
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Product", "Price", "Qty", "Total"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    $
                    {(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right font-medium">
                  Subtotal
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  ${order.itemsPrice.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right font-medium">
                  Shipping
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  ${order.shippingPrice.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right font-medium">
                  Tax
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  ${order.taxPrice.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-right text-lg font-bold"
                >
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold">
                  ${order.totalPrice.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {isModalOpen && (
        <UpdateDeliveryStatusModal
          order={order}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
