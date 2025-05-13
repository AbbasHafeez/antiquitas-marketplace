"use client";

import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

/* -------------------------------------------------------------------------- */
/*  CartProvider – handles guest & logged-in carts                            */
/* -------------------------------------------------------------------------- */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, user, token } = useContext(AuthContext);

  const [cart, setCart]     = useState([]);   // [{ product, quantity }]
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState(null);

  /* ─────────────────────── load cart on mount / auth change ─────────────────────── */
  useEffect(() => {
    const loadCart = async () => {
      setLoad(true);
      try {
        if (isAuthenticated) {
          const { data } = await axios.get("/api/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });

          // ensure array
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
            ? data
            : [];

          setCart(items);
        } else {
          const local = localStorage.getItem("cart");
          setCart(local ? JSON.parse(local) : []);
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load cart";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoad(false);
      }
    };

    loadCart();
  }, [isAuthenticated, token]);

  /* ─────────────────────────── helpers ─────────────────────────── */
  const persistCart = async (cartItems) => {
    try {
      if (isAuthenticated) {
        // backend expects IDs + qty only
        const payload = {
          items: cartItems.map((i) => ({
            product: i.product._id,
            quantity: i.quantity,
          })),
        };

        await axios.post("/api/cart", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        localStorage.setItem("cart", JSON.stringify(cartItems));
      }

      setCart(cartItems);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save cart";
      setError(msg);
      toast.error(msg);
      throw err;
    }
  };

  /* ─────────────────────────── actions ─────────────────────────── */
  const addToCart = async (product, qty = 1) => {
    const idx = cart.findIndex((c) => c.product._id === product._id);
    const updated = [...cart];

    if (idx >= 0) updated[idx].quantity += qty;
    else updated.push({ product, quantity: qty });

    await persistCart(updated);
    toast.success("Item added to cart");
  };

  const removeFromCart = async (id) => {
    const updated = cart.filter((c) => c.product._id !== id);
    await persistCart(updated);
    toast.info("Item removed from cart");
  };

  const updateQuantity = async (id, qty) => {
    if (qty <= 0) return removeFromCart(id);

    const updated = cart.map((c) =>
      c.product._id === id ? { ...c, quantity: qty } : c
    );
    await persistCart(updated);
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await axios.delete("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      localStorage.removeItem("cart");
      setCart([]);
      toast.info("Cart cleared");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to clear cart";
      setError(msg);
      toast.error(msg);
    }
  };

  /* ─────────────────────────── selectors ─────────────────────────── */
  const getCount  = () => cart.reduce((n, i) => n + i.quantity, 0);
  const getTotal  = () => cart.reduce((t, i) => t + i.product.price * i.quantity, 0);

  /* ─────────────────────────── context value ─────────────────────────── */
  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount:  getCount,
        getCartTotal:  getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
