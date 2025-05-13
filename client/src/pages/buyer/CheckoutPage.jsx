"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CartContext } from "../../context/CartContext"
import { AuthContext } from "../../context/AuthContext"
import axios from "axios"
import { toast } from "react-toastify"
import { FaLock, FaCreditCard, FaMoneyBill } from "react-icons/fa"

const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "",
    phone: user?.phone || "",
  })
  const [paymentMethod, setPaymentMethod] = useState("easypaisa")

  // Calculate order totals
  const subtotal = getCartTotal()
  const shipping = 10
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0) {
      navigate("/cart")
    }
  }, [cart, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    for (const field in shippingAddress) {
      if (!shippingAddress[field]) {
        toast.error(`Please enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
        return
      }
    }

    setLoading(true)

    try {
      // Create order items array
      const orderItems = cart.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
      }))

      // Create order
      const response = await axios.post("/api/orders", {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      })

      // Clear cart after successful order
      clearCart()

      // Redirect to order confirmation
      navigate(`/orders/${response.data._id}`, {
        state: { success: true },
      })

      toast.success("Order placed successfully!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address*
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province*
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code*
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country*
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="easypaisa"
                    name="paymentMethod"
                    value="easypaisa"
                    checked={paymentMethod === "easypaisa"}
                    onChange={() => setPaymentMethod("easypaisa")}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="easypaisa" className="ml-3 flex items-center">
                    <FaMoneyBill className="text-green-500 mr-2" />
                    <span>Easypaisa</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="jazzcash"
                    name="paymentMethod"
                    value="jazzcash"
                    checked={paymentMethod === "jazzcash"}
                    onChange={() => setPaymentMethod("jazzcash")}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="jazzcash" className="ml-3 flex items-center">
                    <FaMoneyBill className="text-red-500 mr-2" />
                    <span>JazzCash</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sadapay"
                    name="paymentMethod"
                    value="sadapay"
                    checked={paymentMethod === "sadapay"}
                    onChange={() => setPaymentMethod("sadapay")}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="sadapay" className="ml-3 flex items-center">
                    <FaCreditCard className="text-purple-500 mr-2" />
                    <span>SadaPay</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-3 flex items-center">
                    <FaMoneyBill className="text-gray-500 mr-2" />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <FaLock className="mr-2" />
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="max-h-60 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.product._id} className="flex items-center py-2 border-b">
                  <img
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaLock className="text-green-500 mr-2" />
              <span>Secure Checkout</span>
            </div>
            <p className="text-xs text-gray-500">
              Your payment information is processed securely. We do not store credit card details nor have access to
              your payment information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
