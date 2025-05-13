"use client"

import { useState } from "react"
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"

const DisputeDetailsModal = ({ dispute, onClose, onResolve }) => {
  const [resolution, setResolution] = useState("")
  const [resolutionDetails, setResolutionDetails] = useState("")
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    const newErrors = {}
    if (!resolution) {
      newErrors.resolution = "Please select a resolution"
    }
    if (!resolutionDetails.trim()) {
      newErrors.resolutionDetails = "Please provide resolution details"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onResolve(dispute._id, resolution, resolutionDetails)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Dispute Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Dispute Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Dispute ID</p>
                  <p className="font-medium">#{dispute._id.substring(dispute._id.length - 6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">#{dispute.order._id.substring(dispute.order._id.length - 6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{dispute.status.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Filed</p>
                  <p className="font-medium">{new Date(dispute.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-yellow-500 mr-2" />
                    <p className="font-medium capitalize">{dispute.reason.replace(/_/g, " ")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Parties Involved</h3>
              <div className="space-y-4">
                <div className="border p-3 rounded-md">
                  <p className="text-sm text-gray-500">Filed By</p>
                  <p className="font-medium">{dispute.raisedBy.name}</p>
                  <p className="text-sm">{dispute.raisedBy.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Role: <span className="capitalize">{dispute.raisedBy.role}</span>
                  </p>
                </div>

                <div className="border p-3 rounded-md">
                  <p className="text-sm text-gray-500">Filed Against</p>
                  <p className="font-medium">{dispute.against.name}</p>
                  <p className="text-sm">{dispute.against.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Role: <span className="capitalize">{dispute.against.role}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Dispute Description</h3>
            <div className="border p-4 rounded-md bg-gray-50">
              <p>{dispute.description}</p>
            </div>
          </div>

          {dispute.evidence && dispute.evidence.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Evidence</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dispute.evidence.map((item, index) => (
                  <a
                    key={index}
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border rounded-md overflow-hidden hover:border-primary-500 transition-colors"
                  >
                    <img
                      src={item || "/placeholder.svg"}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {dispute.status === "pending" || dispute.status === "under_review" ? (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-medium mb-4">Resolve Dispute</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution*</label>
                <select
                  value={resolution}
                  onChange={(e) => {
                    setResolution(e.target.value)
                    if (e.target.value) {
                      setErrors({ ...errors, resolution: undefined })
                    }
                  }}
                  className={`w-full p-2 border rounded-md ${errors.resolution ? "border-red-500" : ""}`}
                >
                  <option value="">Select a resolution</option>
                  <option value="refund">Full Refund</option>
                  <option value="partial_refund">Partial Refund</option>
                  <option value="replacement">Replacement</option>
                  <option value="no_action">No Action Required</option>
                  <option value="other">Other</option>
                </select>
                {errors.resolution && <p className="text-red-500 text-sm mt-1">{errors.resolution}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Details*</label>
                <textarea
                  value={resolutionDetails}
                  onChange={(e) => {
                    setResolutionDetails(e.target.value)
                    if (e.target.value.trim()) {
                      setErrors({ ...errors, resolutionDetails: undefined })
                    }
                  }}
                  rows="4"
                  className={`w-full p-2 border rounded-md ${errors.resolutionDetails ? "border-red-500" : ""}`}
                  placeholder="Provide details about the resolution..."
                ></textarea>
                {errors.resolutionDetails && <p className="text-red-500 text-sm mt-1">{errors.resolutionDetails}</p>}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                >
                  <FaCheckCircle className="mr-2" /> Resolve Dispute
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" /> Resolution
              </h3>
              <div className="mb-2">
                <p className="text-sm text-gray-500">Resolution Type</p>
                <p className="font-medium capitalize">{dispute.resolution?.replace(/_/g, " ") || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolution Details</p>
                <p>{dispute.resolutionDetails || "No details provided"}</p>
              </div>
              {dispute.resolvedBy && (
                <div className="mt-2 text-sm text-gray-500">
                  Resolved by {dispute.resolvedBy.name} on {new Date(dispute.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DisputeDetailsModal
