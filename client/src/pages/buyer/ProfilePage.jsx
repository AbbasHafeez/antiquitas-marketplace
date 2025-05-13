"use client";

import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaKey,
} from "react-icons/fa";

const ProfilePage = () => {
  /* ────────── context & base state ────────── */
  const { user, updateProfile } = useContext(AuthContext);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  /* ────────── profile info state ────────── */
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  /* ────────── password change state ────────── */
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpPhase, setOtpPhase] = useState(false);   // false ➜ show pw form
  const [otp, setOtp]           = useState("");      // OTP input

  /* ────────── load user into local state ────────── */
  useEffect(() => {
    if (user) {
      setProfileData({
        name : user.name  || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street     : user.address?.street     || "",
          city       : user.address?.city       || "",
          state      : user.address?.state      || "",
          postalCode : user.address?.postalCode || "",
          country    : user.address?.country    || "",
        },
      });
    }
  }, [user]);

  /* ────────── handlers: profile info ────────── */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfileData({
        ...profileData,
        [parent]: { ...profileData[parent], [child]: value },
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await updateProfile(profileData);
      if (ok) toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ────────── handlers: password change ────────── */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  /* step 1 – send OTP */
  const sendOtp = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/users/request-otp", {
        currentPassword: passwordData.currentPassword,
      });
      toast.info("OTP sent to your email");
      setOtpPhase(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* step 2 – verify OTP & update password */
  const updatePassword = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }
    setLoading(true);
    try {
      await axios.put("/api/users/change-password", {
        otp,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      /* reset local state */
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtp("");
      setOtpPhase(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ────────── component UI ────────── */
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* ---------- TABS ---------- */}
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "profile"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="inline mr-2" /> Profile Information
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "password"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("password")}
          >
            <FaKey className="inline mr-2" /> Change Password
          </button>
        </div>

        {/* ---------- TAB CONTENT ---------- */}
        <div className="p-6">
          {activeTab === "profile" ? (
            /* -------- PROFILE FORM -------- */
            <form onSubmit={handleProfileSubmit}>
              {/*  (Existing profile inputs – unchanged) */}
              {/* --- Name, Email, Phone --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* name */}
                <div>
                  <label className="block text-sm mb-1">
                    <FaUser className="inline mr-2 text-gray-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                {/* email */}
                <div>
                  <label className="block text-sm mb-1">
                    <FaEnvelope className="inline mr-2 text-gray-500" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full p-2 border rounded-md bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                {/* phone */}
                <div>
                  <label className="block text-sm mb-1">
                    <FaPhone className="inline mr-2 text-gray-500" /> Phone
                    Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* --- Address section (unchanged) --- */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">
                  <FaMapMarkerAlt className="inline mr-2 text-gray-500" />{" "}
                  Address Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* street */}
                  <div>
                    <label className="block text-sm mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={profileData.address.street}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  {/* city */}
                  <div>
                    <label className="block text-sm mb-1">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={profileData.address.city}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  {/* state */}
                  <div>
                    <label className="block text-sm mb-1">State/Province</label>
                    <input
                      type="text"
                      name="address.state"
                      value={profileData.address.state}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  {/* postal code */}
                  <div>
                    <label className="block text-sm mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={profileData.address.postalCode}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  {/* country */}
                  <div>
                    <label className="block text-sm mb-1">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={profileData.address.country}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            /* -------- TWO‑STEP PASSWORD FORM -------- */
            <div className="max-w-md mx-auto space-y-6">
              {!otpPhase ? (
                /* ----- Step 1: current + new pw ----- */
                <>
                  <div>
                    <label className="block text-sm mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded-md"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={sendOtp}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? "Sending OTP…" : "Send OTP"}
                  </button>
                </>
              ) : (
                /* ----- Step 2: OTP input ----- */
                <>
                  <div>
                    <label className="block text-sm mb-1">Enter OTP</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={updatePassword}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? "Updating…" : "Update Password"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
