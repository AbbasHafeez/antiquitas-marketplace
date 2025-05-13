"use client";

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google"; // 📢 Import GoogleLogin
import jwt_decode from "jwt-decode";                // 📢 Import jwt-decode

// ────────────────────────────────────────────────────────────────────────
// Map role to landing page
const routeByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "seller":
      return "/seller/dashboard";
    case "shipper":
      return "/shipper/dashboard";
    default:
      return "/";
  }
};
// ────────────────────────────────────────────────────────────────────────

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle normal form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Normal signup (with backend API)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const { success, role } = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (success) {
        toast.success("Registration successful!");
        navigate(routeByRole(role), { replace: true });
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 📍 Handle Google Sign Up Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwt_decode(credential);

      const res = await fetch("/api/auth/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          role: formData.role,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        toast.success("Google Signup successful!");
        navigate(routeByRole(data.role || "buyer"), { replace: true });
      } else {
        toast.error(data.message || "Google Signup failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Google signup failed!");
    }
  };

  // 📍 Handle Google Sign Up Error
  const handleGoogleError = () => {
    toast.error("Google signup was unsuccessful. Try again.");
  };

  /* ─────────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Normal Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            required
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          <input
            required
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          <input
            required
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          <input
            required
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-sm text-center">
            By signing up, you agree to our{" "}
            <Link
              to="/terms"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Privacy Policy
            </Link>
          </p>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center my-4">
          <span className="text-gray-400">or</span>
        </div>

        {/* Google Sign Up Button */}
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
  );
};

export default RegisterPage;
