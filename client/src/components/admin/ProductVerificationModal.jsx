"use client"

import { useState } from "react"
import { FaTimes, FaCheck, FaTimesCircle } from "react-icons/fa"

const ProductVerificationModal = ({ product, onClose, onVerify }) => {
  const [verificationAction, setVerificationAction] = useState("verify") // "verify" or "reject"
  const [rejectionReason, setRejectionReason] = useState("")
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    if (verificationAction === "reject" && !rejectionReason.trim()) {
      setErrors({ rejectionReason: "Please provide a reason for rejection" })
      return
    }

    onVerify(verificationAction === "verify", rejectionReason)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {verificationAction === "verify" ? "Verify Product" : "Reject Product"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="md:w-1/3">
              <div className="bg-gray-100 rounded-lg p-2">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-contain rounded-md"
                />
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {product.images.slice(1).map((image, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-1">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-16 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:w-2/3">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.category.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{product.age} years</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Origin</p>
                  <p className="font-medium">{product.origin}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium capitalize">{product.condition}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium">{product.seller.name}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <div
                  className="text-sm border rounded-md p-3 max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                ></div>
              </div>

              {product.additionalInfo && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Additional Information</p>
                  <p className="text-sm border rounded-md p-3">{product.additionalInfo}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setVerificationAction("verify")}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                  verificationAction === "verify"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaCheck className="mr-2" /> Verify Product
              </button>

              <button
                type="button"
                onClick={() => setVerificationAction("reject")}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                  verificationAction === "reject"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaTimesCircle className="mr-2" /> Reject Product
              </button>
            </div>

            {verificationAction === "reject" && (
              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection*
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value)
                    if (e.target.value.trim()) {
                      setErrors({ ...errors, rejectionReason: undefined })
                    }
                  }}
                  rows="3"
                  className={`w-full p-2 border rounded-md ${errors.rejectionReason ? "border-red-500" : ""}`}
                  placeholder="Please provide a detailed reason for rejecting this product"
                ></textarea>
                {errors.rejectionReason && <p className="text-red-500 text-sm mt-1">{errors.rejectionReason}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-md text-white ${
                  verificationAction === "verify" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {verificationAction === "verify" ? "Confirm Verification" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductVerificationModal
