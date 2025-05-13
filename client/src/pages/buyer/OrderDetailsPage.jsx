"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate }     from "react-router-dom";
import axios                                from "axios";
import { toast }                            from "react-toastify";
import { AuthContext }                      from "../../context/AuthContext";
import { FaArrowLeft, FaTrashAlt }          from "react-icons/fa";

export default function OrderDetailsPage() {
  const { id }       = useParams();
  const { token }    = useContext(AuthContext);
  const navigate     = useNavigate();

  const [order, setOrder]   = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Unable to fetch order");
        navigate("/orders/myorders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, token, navigate]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.put(
        `/api/orders/${id}/status`,
        { status: "cancelled", cancelReason: "User requested" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order cancelled");
      // refresh
      const { data } = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-b-transparent rounded-full"></span>
      </div>
    );

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-primary-600 hover:text-primary-800"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-4">
        Order #{order._id.slice(-6).toUpperCase()}
      </h1>

      {/* ─── Order meta ─── */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-semibold">Placed:</span>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {order.status}
          </p>
          <p>
            <span className="font-semibold">Payment:</span>{" "}
            {order.paymentMethod.toUpperCase()}
          </p>
          {order.isPaid && (
            <p>
              <span className="font-semibold">Paid At:</span>{" "}
              {new Date(order.paidAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* ─── Items ─── */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <div className="divide-y">
          {order.orderItems.map((it) => (
            <div key={it.product._id} className="flex py-4">
              <img
                src={it.image || it.product?.images?.[0] || "/placeholder.svg"}
                alt={it.name}
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <Link
                  to={`/products/${it.product._id}`}
                  className="font-medium hover:underline"
                >
                  {it.name}
                </Link>
                <p className="text-xs text-gray-500">Qty: {it.quantity}</p>
              </div>
              <div className="font-medium">
                ${(it.price * it.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── totals ─── */}
      <div className="bg-white rounded-lg shadow-md p-6 md:max-w-md">
        <h2 className="text-lg font-semibold mb-4">Order Total</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Items</span>
            <span>${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2 font-bold flex justify-between">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ─── Cancel Order ─── */}
      {order.status === "pending" && (
        <div className="mt-6 text-right">
          <button
            onClick={handleCancel}
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            <FaTrashAlt className="mr-2" /> Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}
