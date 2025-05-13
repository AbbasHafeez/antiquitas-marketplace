"use client"

import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { FaUser, FaTruck, FaEdit, FaMapMarkerAlt, FaPlus, FaTimes } from "react-icons/fa"

const ShipperProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceAreas: [],
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  })

  const [newServiceArea, setNewServiceArea] = useState("")

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        company: user.company || "",
        serviceAreas: user.serviceAreas || [],
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          postalCode: user.address?.postalCode || "",
          country: user.address?.country || "",
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

  const handleAddServiceArea = () => {
    if (newServiceArea.trim()) {
      if (!profileData.serviceAreas.includes(newServiceArea.trim())) {
        setProfileData({
          ...profileData,
          serviceAreas: [...profileData.serviceAreas, newServiceArea.trim()],
        })
      }
      setNewServiceArea("")
    }
  }

  const handleRemoveServiceArea = (area) => {
    setProfileData({
      ...profileData,
      serviceAreas: profileData.serviceAreas.filter((a) => a !== area),
    })
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
      <h1 className="text-2xl font-bold mb-6">Shipper Profile</h1>

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
              activeTab === "shipping" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("shipping")}
          >
            <FaTruck className="inline mr-2" /> Shipping Information
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

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={profileData.company}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    <FaMapMarkerAlt className="inline mr-2 text-gray-500" /> Address Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="address.postalCode"
                        name="address.postalCode"
                        value={profileData.address.postalCode}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Service Areas</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add the areas where you provide shipping services. This helps us match you with orders in your
                    service regions.
                  </p>

                  <div className="flex items-center mb-4">
                    <input
                      type="text"
                      value={newServiceArea}
                      onChange={(e) => setNewServiceArea(e.target.value)}
                      className="flex-grow p-2 border rounded-l-md"
                      placeholder="Add a city, region, or postal code"
                    />
                    <button
                      type="button"
                      onClick={handleAddServiceArea}
                      className="bg-primary-600 text-white p-2 rounded-r-md hover:bg-primary-700"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.serviceAreas.length === 0 ? (
                      <p className="text-gray-500 italic">No service areas added yet</p>
                    ) : (
                      profileData.serviceAreas.map((area, index) => (
                        <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                          <FaMapMarkerAlt className="text-primary-600 mr-2" />
                          <span>{area}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceArea(area)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Shipping Preferences</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These preferences help us match you with orders that fit your capabilities.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
                        <span className="ml-2">Available for fragile antique deliveries</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
                        <span className="ml-2">Available for international shipping</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
                        <span className="ml-2">Available for same-day delivery</span>
                      </label>
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

export default ShipperProfilePage
