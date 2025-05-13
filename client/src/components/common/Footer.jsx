import { Link } from "react-router-dom"
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Antiquitas</h3>
            <p className="text-gray-300 mb-4">
              Connecting collectors, enthusiasts, and sellers in a trusted marketplace for authentic antiques since
              2015.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <FaPinterest size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/authentication" className="text-gray-300 hover:text-white transition-colors">
                  Authentication Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-primary-300" />
                <span className="text-gray-300">
                  123 Antique Avenue
                  <br />
                  Heritage District
                  <br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-start">
                <FaPhone className="mt-1 mr-3 text-primary-300" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-primary-300" />
                <span className="text-gray-300">info@antiquitas.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; {currentYear} Antiquitas. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
