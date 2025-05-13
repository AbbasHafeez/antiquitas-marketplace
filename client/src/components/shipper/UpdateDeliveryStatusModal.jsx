"use client";

import { useState } from "react";
import { FaTimes, FaTruck, FaCheckCircle, FaUpload } from "react-icons/fa";
import axios from "axios";

const UpdateDeliveryStatusModal = ({ order, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(order.status === "processing" ? "shipped" : "delivered");
  const [deliveryProof, setDeliveryProof] = useState(null);
  const [deliveryProofPreview, setDeliveryProofPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDeliveryProof(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setDeliveryProofPreview(event.target.result);
      };
      reader.readAsDataURL(file);

      setErrors({ ...errors, deliveryProof: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (newStatus === "delivered" && !deliveryProof) {
      newErrors.deliveryProof = "Please upload proof of delivery";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let uploadedProofUrl = null;

    if (newStatus === "delivered" && deliveryProof) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("proofImage", deliveryProof); // ✅ important
        const { data } = await axios.post("/api/upload/proof", formData);
        uploadedProofUrl = data.file; // server returns { file: "/uploads/proofs/..." }
      } catch (err) {
        console.error("Failed to upload proof image", err);
        setErrors({ deliveryProof: "Failed to upload proof image" });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onUpdateStatus(newStatus, uploadedProofUrl);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Update Delivery Status</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <div className="text-gray-900 font-medium">#{order._id.substring(order._id.length - 6)}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
            <div className="text-gray-900 font-medium capitalize">{order.status}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <div className="relative">
              <select
                value={newStatus}
                onChange={handleStatusChange}
                className="w-full p-2 border rounded-md appearance-none pr-8"
              >
                {order.status === "processing" && <option value="shipped">Shipped</option>}
                {(order.status === "processing" || order.status === "shipped") && (
                  <option value="delivered">Delivered</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {newStatus === "shipped" && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-center text-blue-700 mb-2">
                <FaTruck className="mr-2" />
                <span className="font-medium">Shipping Instructions</span>
              </div>
              <p className="text-sm text-blue-600">
                Please ensure you have properly packaged the items and included all necessary paperwork before marking
                as shipped.
              </p>
            </div>
          )}

          {newStatus === "delivered" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Proof Photo*</label>
              <div
                className={`border-2 border-dashed rounded-md p-4 text-center ${
                  errors.deliveryProof ? "border-red-500" : "border-gray-300"
                }`}
              >
                {deliveryProofPreview ? (
                  <div>
                    <img
                      src={deliveryProofPreview || "/placeholder.svg"}
                      alt="Delivery proof preview"
                      className="mx-auto h-40 object-contain mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryProof(null);
                        setDeliveryProofPreview(null);
                      }}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 relative">
                    <FaUpload className="mx-auto text-gray-400 text-3xl" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop a photo showing proof of delivery</p>
                    <p className="text-xs text-gray-400">(Photo should show the package at the delivery location)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
              {errors.deliveryProof && <p className="text-red-500 text-sm mt-1">{errors.deliveryProof}</p>}
              <div className="mt-2 p-4 bg-green-50 rounded-md">
                <div className="flex items-center text-green-700 mb-2">
                  <FaCheckCircle className="mr-2" />
                  <span className="font-medium">Delivery Confirmation</span>
                </div>
                <p className="text-sm text-green-600">
                  By marking this order as delivered, you confirm that the package has been successfully delivered to
                  the customer's address.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`px-4 py-2 rounded-md text-white ${
                newStatus === "shipped" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
              } ${uploading && "opacity-50 cursor-not-allowed"}`}
            >
              {uploading ? "Uploading..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDeliveryStatusModal;
