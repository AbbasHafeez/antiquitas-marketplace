"use client";

import jwt_decode from "jwt-decode";
import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

/* Map user role → landing page */
const routeByRole = (role, fallback) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "seller":
      return "/seller/dashboard";
    case "shipper":
      return "/shipper/dashboard";
    default:
      return fallback || "/profile"; // Fallback to profile
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loadUser } = useContext(AuthContext);  // ✅ notice we use loadUser here
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/profile";

  /* ───── Normal login ───── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, role, message } = await login(email, password, remember);
      setLoading(false);

      if (!success) {
        toast.error(message || "Invalid credentials");
        return;
      }

      navigate(routeByRole(role, from));
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Login failed. Please try again.");
    }
  };

  /* ───── Google login ───── */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwt_decode(credential);
  
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: decoded.email }),
      });
  
      const data = await res.json();
      if (res.ok) {
        // ✅ Save userInfo and token separately
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", data.token);  // <-- THIS was missing!
  
        // ✅ Dispatch storage event so AuthContext reloads
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(new Event("storage"));
        }
  
        toast.success("Google login successful!");
        window.location.replace(routeByRole(data.role || "buyer", "/profile"));
      } else {
        toast.error(data.message || "Google login failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Google login failed!");
    }
  };
  

  const handleGoogleError = () => {
    toast.error("Google Sign-In was unsuccessful. Try again.");
  };

  /* ───── UI ───── */
  return (
    <GoogleOAuthProvider clientId="1028729527829-solfiilg76ga896a97op2kul0cpmiur4.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-900">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center justify-center my-4">
            <span className="text-gray-400">or</span>
          </div>

          {/* Google Sign-in */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="300"
              shape="pill"
              size="large"
              theme="outline"
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
