"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CartContext } from "../../context/CartContext"
import { FaTrash, FaArrowLeft, FaShoppingBag } from "react-icons/fa"

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) quantity = 1
    updateQuantity(productId, quantity)
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    navigate("/checkout")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaShoppingBag className="mx-auto text-gray-300 text-6xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any antiques to your cart yet.</p>
          <Link
            to="/products"
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Antiques
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cart.map((item) => (
                    <tr key={item.product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              className="h-16 w-16 object-cover rounded-md"
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/products/${item.product._id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600"
                            >
                              {item.product.name}
                            </Link>
                            <div className="text-xs text-gray-500">
                              {item.product.condition.charAt(0).toUpperCase() + item.product.condition.slice(1)}{" "}
                              condition
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${item.product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center border rounded-md w-24">
                          <button
                            className="px-3 py-1 border-r"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product._id, Number.parseInt(e.target.value))}
                            className="w-full text-center py-1 focus:outline-none"
                          />
                          <button
                            className="px-3 py-1 border-l"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Item"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between">
              <Link to="/products" className="flex items-center text-primary-600 hover:text-primary-800">
                <FaArrowLeft className="mr-2" /> Continue Shopping
              </Link>
              <button onClick={clearCart} className="text-red-600 hover:text-red-800">
                Clear Cart
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(getCartTotal() + 10 + getCartTotal() * 0.05).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
