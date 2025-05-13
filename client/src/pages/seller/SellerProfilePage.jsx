"use client"

import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { FaUser, FaStore, FaEdit, FaCamera } from "react-icons/fa"
import axios from "axios"

const SellerProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    shopName: "",
    shopDescription: "",
    shopLogo: "",
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      swiftCode: "",
    },
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        shopName: user.shopName || "",
        shopDescription: user.shopDescription || "",
        shopLogo: user.shopLogo || "",
        bankDetails: {
          accountName: user.bankDetails?.accountName || "",
          accountNumber: user.bankDetails?.accountNumber || "",
          bankName: user.bankDetails?.bankName || "",
          swiftCode: user.bankDetails?.swiftCode || "",
        },
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value,
        },
      })
    } else {
      setProfileData({
        ...profileData,
        [name]: value,
      })
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("images", file)

    try {
      setLoading(true)
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data && response.data[0]) {
        setProfileData({
          ...profileData,
          shopLogo: response.data[0].url,
        })
        toast.success("Shop logo uploaded successfully")
      }
    } catch (error) {
      toast.error("Failed to upload shop logo")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await updateProfile(profileData)

      if (success) {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seller Profile</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "profile" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="inline mr-2" /> Personal Information
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "shop" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("shop")}
          >
            <FaStore className="inline mr-2" /> Shop Information
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleProfileSubmit}>
            {activeTab === "profile" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Bank Details</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your bank details are required for receiving payments from sales.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="bankDetails.accountName" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        id="bankDetails.accountName"
                        name="bankDetails.accountName"
                        value={profileData.bankDetails.accountName}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bankDetails.accountNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Account Number
                      </label>
                      <input
                        type="text"
                        id="bankDetails.accountNumber"
                        name="bankDetails.accountNumber"
                        value={profileData.bankDetails.accountNumber}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="bankDetails.bankName" className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        id="bankDetails.bankName"
                        name="bankDetails.bankName"
                        value={profileData.bankDetails.bankName}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="bankDetails.swiftCode" className="block text-sm font-medium text-gray-700 mb-1">
                        SWIFT/BIC Code
                      </label>
                      <input
                        type="text"
                        id="bankDetails.swiftCode"
                        name="bankDetails.swiftCode"
                        value={profileData.bankDetails.swiftCode}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={profileData.shopLogo || "/placeholder.svg?height=150&width=150"}
                          alt="Shop Logo"
                          className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700"
                        >
                          <FaCamera />
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Upload shop logo</p>
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <div className="mb-4">
                      <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        id="shopName"
                        name="shopName"
                        value={profileData.shopName}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Shop Description
                      </label>
                      <textarea
                        id="shopDescription"
                        name="shopDescription"
                        value={profileData.shopDescription}
                        onChange={handleProfileChange}
                        rows="5"
                        className="w-full p-2 border rounded-md"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        Describe your shop, specialties, and the types of antiques you sell.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <FaEdit className="mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SellerProfilePage
