"use client";

import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import {
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";

/* helper so we can reuse one styled link inside dropdown */
const MenuLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-sm hover:bg-gray-100"
  >
    {children}
  </Link>
);

const Divider = () => <div className="h-px bg-gray-200 my-1" />;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // close user dropdown if clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  /* roles */
  const role = user?.role;
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";
  const isAdmin = role === "admin";
  const isShipper = role === "shipper";

  /* where “Dashboard” should go */
  const dashLink = () => {
    if (!user) return "/login";
    if (isAdmin)   return "/admin/dashboard";
    if (isSeller)  return "/seller/dashboard";
    if (isShipper) return "/shipper/dashboard";
    return "/profile";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm.trim()}`);
      setSearchTerm("");
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-primary-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        {/* top bar */}
        <div className="flex justify-between items-center py-4">
          {/* logo */}
          <Link to="/" className="text-2xl font-serif font-bold">
            Antiquitas
          </Link>

          {/* mobile burger */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {["Home", "Products", "About", "Contact"].map((t) => (
              <Link key={t} to={t === "Home" ? "/" : `/${t.toLowerCase()}`}>
                {t}
              </Link>
            ))}
          </div>

          {/* desktop search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center ml-6"
          >
            <input
              type="text"
              placeholder="Search antiques..."
              className="px-4 py-2 rounded-l-md text-gray-800 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-secondary-600 px-4 py-2 rounded-r-md hover:bg-secondary-700">
              <FaSearch />
            </button>
          </form>

          {/* desktop user area */}
          <div className="hidden md:flex items-center space-x-4">
            {/* buyer cart */}
            {isAuthenticated && isBuyer && (
              <Link to="/cart" className="relative">
                <FaShoppingCart size={20} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* avatar dropdown */}
            {isAuthenticated ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center space-x-2"
                >
                  <FaUser size={20} />
                  <span>{user.name.split(" ")[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full w-56 bg-white text-gray-700 rounded-md shadow-lg py-1 z-10">
                    {/* seller menu */}
                    {isSeller && (
                      <>
                        <MenuLink to="/seller/dashboard" onClick={() => setUserMenuOpen(false)}>
                          Dashboard
                        </MenuLink>
                        <MenuLink to="/seller/products" onClick={() => setUserMenuOpen(false)}>
                          My Products
                        </MenuLink>
                        <MenuLink to="/seller/products/add" onClick={() => setUserMenuOpen(false)}>
                          Add Product
                        </MenuLink>
                        <MenuLink to="/seller/orders" onClick={() => setUserMenuOpen(false)}>
                          Orders
                        </MenuLink>
                        <MenuLink to="/seller/earnings" onClick={() => setUserMenuOpen(false)}>
                          Earnings
                        </MenuLink>
                        <MenuLink to="/seller/profile" onClick={() => setUserMenuOpen(false)}>
                          Profile
                        </MenuLink>
                        <Divider />
                      </>
                    )}

                    {/* buyer menu */}
                    {isBuyer && (
                      <>
                        <MenuLink to="/profile" onClick={() => setUserMenuOpen(false)}>
                          My Profile
                        </MenuLink>
                        <MenuLink to="/orders" onClick={() => setUserMenuOpen(false)}>
                          My Orders
                        </MenuLink>
                        <MenuLink to="/wishlist" onClick={() => setUserMenuOpen(false)}>
                          Wishlist
                        </MenuLink>
                        <Divider />
                      </>
                    )}

                    {/* shipper menu */}
                    {isShipper && (
                      <>
                        <MenuLink to="/shipper/dashboard" onClick={() => setUserMenuOpen(false)}>
                          Dashboard
                        </MenuLink>
                        <MenuLink to="/shipper/orders" onClick={() => setUserMenuOpen(false)}>
                          Assigned Orders
                        </MenuLink>
                        <MenuLink to="/shipper/delivery-history" onClick={() => setUserMenuOpen(false)}>
                          Delivery History
                        </MenuLink>
                        <MenuLink to="/shipper/profile" onClick={() => setUserMenuOpen(false)}>
                          Profile
                        </MenuLink>
                        <Divider />
                      </>
                    )}

                    {/* admin menu */}
                    {isAdmin && (
                      <>
                        <MenuLink to="/admin/dashboard" onClick={() => setUserMenuOpen(false)}>
                          Dashboard
                        </MenuLink>
                        <Divider />
                      </>
                    )}

                    {/* logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-secondary-600 px-4 py-2 rounded-md hover:bg-secondary-700"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>

        {/* mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-primary-700 space-y-4">
            {["Home", "Products", "About", "Contact"].map((t) => (
              <Link
                key={t}
                to={t === "Home" ? "/" : `/${t.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
              >
                {t}
              </Link>
            ))}

            {/* mobile search */}
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search antiques..."
                className="flex-1 px-4 py-2 rounded-l-md text-gray-800 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-secondary-600 px-4 py-2 rounded-r-md hover:bg-secondary-700">
                <FaSearch />
              </button>
            </form>

            {/* buyer cart mobile */}
            {isAuthenticated && isBuyer && (
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center"
              >
                <FaShoppingCart className="mr-2" />
                Cart ({getCartCount()})
              </Link>
            )}

            {/* auth section mobile */}
            {isAuthenticated ? (
              <>
                <Link
                  to={dashLink()}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2"
                >
                  {isBuyer ? "My Profile" : "Dashboard"}
                </Link>

                {isBuyer && (
                  <>
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Wishlist
                    </Link>
                  </>
                )}

                {isSeller && (
                  <>
                    <Link
                      to="/seller/products"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      My Products
                    </Link>
                    <Link
                      to="/seller/products/add"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Add Product
                    </Link>
                    <Link
                      to="/seller/orders"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/seller/earnings"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Earnings
                    </Link>
                  </>
                )}

                {isShipper && (
                  <>
                    <Link
                      to="/shipper/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/shipper/orders"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Assigned Orders
                    </Link>
                    <Link
                      to="/shipper/delivery-history"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Delivery History
                    </Link>
                    <Link
                      to="/shipper/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2"
                    >
                      Profile
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center py-2"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="bg-secondary-600 px-4 py-2 rounded-md hover:bg-secondary-700"
              >
                Login / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
