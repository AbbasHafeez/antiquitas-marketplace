"use client";

import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordPage = () => {
  /* ─────────────── react‑router params ─────────────── */
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";   // passed from Forgot‑Password
  const navigate = useNavigate();

  /* ─────────────── local state ─────────────── */
  const [otp, setOtp]                         = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  /* Guard: if user lands here without email param, send back */
  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  /* ─────────────── submit handler ─────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      await axios.put("/api/auth/reset-password", {
        email,
        otp,
        password,
      });
      toast.success("Password reset successfully 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────── UI ─────────────── */
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <header>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to&nbsp;
            <span className="font-medium">{email}</span>, then choose a new
            password.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* OTP */}
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <input
              id="otp"
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="6‑digit OTP"
            />
          </div>

          {/* new password */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              New password
            </label>
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="New password"
            />
            <span
              onClick={() => setShowPw(!showPw)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* confirm password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Confirm new password"
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Reset password"}
          </button>

          <p className="text-sm text-center">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              ← Back to login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default ResetPasswordPage;
