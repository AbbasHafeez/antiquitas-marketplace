"use client"

import { useState } from "react"
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPinterest,
} from "react-icons/fa"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      setSubmitError("There was an error sending your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-24"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581683705068-ca8f49d11b63?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Have questions or need assistance? We're here to help you with all your antique needs.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {submitSuccess && (
                <div className="bg-green-100 text-green-700 p-4 rounded-md">
                  Your message has been sent successfully. We'll get back to you soon!
                </div>
              )}

              {submitError && <div className="bg-red-100 text-red-700 p-4 rounded-md">{submitError}</div>}
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Contact Information</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FaMapMarkerAlt className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Our Location</h3>
                    <p className="text-gray-600">
                      123 Antique Avenue
                      <br />
                      Heritage District
                      <br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FaPhone className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Phone</h3>
                    <p className="text-gray-600">
                      +1 (555) 123-4567
                      <br />
                      +1 (555) 987-6543
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FaEnvelope className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-gray-600">
                      info@antiquitas.com
                      <br />
                      support@antiquitas.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FaClock className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM
                      <br />
                      Saturday: 10:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <button type="button" className="bg-primary-100 p-3 rounded-full hover:bg-primary-200 transition-colors">
                    <FaFacebook className="text-primary-600" />
                  </button>
                  <button type="button" className="bg-primary-100 p-3 rounded-full hover:bg-primary-200 transition-colors">
                    <FaTwitter className="text-primary-600" />
                  </button>
                  <button href="#" className="bg-primary-100 p-3 rounded-full hover:bg-primary-200 transition-colors">
                    <FaInstagram className="text-primary-600" />
                  </button>
                  <button href="#" className="bg-primary-100 p-3 rounded-full hover:bg-primary-200 transition-colors">
                    <FaPinterest className="text-primary-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-8 container mx-auto px-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.0059418!3d40.7127847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMDInNDYuMCJOIDc0wrAwMCczMy45Ilc!5e0!3m2!1sen!2sus!4v1619450269722!5m2!1sen!2sus"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Antiquitas Location"
          ></iframe>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">How do I know the antiques are authentic?</h3>
              <p className="text-gray-600">
                All items listed on Antiquitas undergo a rigorous authentication process by our team of experts before
                being approved for sale. Each verified item receives our authentication badge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, bank transfers, and select cryptocurrency payments for your
                convenience and security.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">How is shipping handled for fragile antiques?</h3>
              <p className="text-gray-600">
                We partner with specialized shipping companies experienced in handling valuable antiques. All items are
                carefully packaged with appropriate materials and fully insured during transit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">What if I'm not satisfied with my purchase?</h3>
              <p className="text-gray-600">
                We offer a 14-day return policy for most items. Please review the specific return policy for each item
                as some rare or fragile antiques may have special conditions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
