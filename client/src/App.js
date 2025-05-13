"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/* ─────────── Context Providers ─────────── */
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";

/* ─────────── Layout ─────────── */
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

/* ─────────── Public pages ─────────── */
import HomePage     from "./pages/HomePage";
import AboutPage    from "./pages/AboutPage";
import ContactPage  from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

/* ─────────── Auth pages ─────────── */
import LoginPage          from "./pages/auth/LoginPage";
import RegisterPage       from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage";

/* ─────────── Buyer pages ─────────── */
import ProductsPage        from "./pages/buyer/ProductsPage";
import ProductDetailsPage  from "./pages/buyer/ProductDetailsPage";
import CartPage            from "./pages/buyer/CartPage";
import CheckoutPage        from "./pages/buyer/CheckoutPage";
import OrderHistoryPage    from "./pages/buyer/OrderHistoryPage";
import OrderDetailsPage    from "./pages/buyer/OrderDetailsPage";
import WishlistPage        from "./pages/buyer/WishlistPage";
import ProfilePage         from "./pages/buyer/ProfilePage";

/* ─────────── Seller pages ─────────── */
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import SellerProductsPage  from "./pages/seller/SellerProductsPage";
import AddProductPage      from "./pages/seller/AddProductPage";
import EditProductPage     from "./pages/seller/EditProductPage";
import OrdersPage          from "./pages/seller/OrdersPage";
import EarningsPage        from "./pages/seller/EarningsPage";
import SellerProfilePage   from "./pages/seller/SellerProfilePage";

/* ─────────── Admin pages ─────────── */
import AdminDashboardPage     from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage        from "./pages/admin/AdminOrdersPage";
import UserManagementPage     from "./pages/admin/UserManagementPage";
import ProductApprovalPage    from "./pages/admin/ProductApprovalPage";
import ProductDetail          from "./pages/admin/ProductDetail";
import ShipmentPartnersPage   from "./pages/admin/ShipmentPartnersPage";
import AnalyticsPage          from "./pages/admin/AnalyticsPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import DisputeCenterPage      from "./pages/admin/DisputeCenterPage";

/* ─────────── Shipper pages ────────── */
import ShipperDashboardPage  from "./pages/shipper/ShipperDashboardPage";
import AssignedOrdersPage    from "./pages/shipper/AssignedOrdersPage";
import DeliveryHistoryPage   from "./pages/shipper/DeliveryHistoryPage";
import OrderDetailPage       from "./pages/shipper/OrderDetailPage";
import ShipperProfilePage    from "./pages/shipper/ShipperProfilePage";

/* ─────────── Route guards ─────────── */
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminRoute   from "./components/auth/AdminRoute";
import SellerRoute  from "./components/auth/SellerRoute";
import ShipperRoute from "./components/auth/ShipperRoute";

function App() {
  const clientId =
    "1028729527829-solfiilg76ga896a97op2kul0cpmiur4.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    {/* ───── Public ───── */}
                    <Route path="/"             element={<HomePage />} />
                    <Route path="/about"        element={<AboutPage />} />
                    <Route path="/contact"      element={<ContactPage />} />
                    <Route path="/products"     element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />

                    {/* ───── Auth ───── */}
                    <Route path="/login"            element={<LoginPage />} />
                    <Route path="/register"         element={<RegisterPage />} />
                    <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

                    {/* OTP‑based flow */}
                    <Route path="/reset-password"   element={<ResetPasswordPage />} />
                    {/* If you still support token links, keep this too: */}
                    {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

                    {/* ───── Buyer (protected) ───── */}
                    <Route
                      path="/cart"
                      element={
                        <PrivateRoute>
                          <CartPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <PrivateRoute>
                          <CheckoutPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <PrivateRoute>
                          <OrderHistoryPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <PrivateRoute>
                          <OrderDetailsPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <PrivateRoute>
                          <WishlistPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      }
                    />

                    {/* ───── Seller (protected) ───── */}
                    <Route
                      path="/seller/dashboard"
                      element={
                        <SellerRoute>
                          <SellerDashboardPage />
                        </SellerRoute>
                      }
                    />
                    <Route
                      path="/seller/products"
                      element={
                        <SellerRoute>
                          <SellerProductsPage />
                        </SellerRoute>
                      }
                    />
                    <Route
                      path="/seller/products/add"
                      element={
                        <SellerRoute>
                          <AddProductPage />
                        </SellerRoute>
                      }
                    />
                    <Route
                      path="/seller/products/edit/:id"
                      element={
                        <SellerRoute>
                          <EditProductPage />
                        </SellerRoute>
                      }
                    />
                    <Route
                      path="/seller/orders"
                      element={
                        <SellerRoute>
                          <OrdersPage />
                        </SellerRoute>
                      }
                    />
                    <Route
                      path="/seller/earnings"
                      element={
                        <SellerRoute>
                          <EarningsPage />
                        </SellerRoute>
                      }
                    />
                    <Route
                      path="/seller/profile"
                      element={
                        <SellerRoute>
                          <SellerProfilePage />
                        </SellerRoute>
                      }
                    />

                    {/* ───── Admin (protected) ───── */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminRoute>
                          <UserManagementPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminRoute>
                          <AdminOrdersPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders/:id"
                      element={
                        <AdminRoute>
                          <OrderDetailsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/products/approval"
                      element={
                        <AdminRoute>
                          <ProductApprovalPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/products/:id"
                      element={
                        <AdminRoute>
                          <ProductDetail />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/shipment-partners"
                      element={
                        <AdminRoute>
                          <ShipmentPartnersPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/analytics"
                      element={
                        <AdminRoute>
                          <AnalyticsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <AdminRoute>
                          <CategoryManagementPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/disputes"
                      element={
                        <AdminRoute>
                          <DisputeCenterPage />
                        </AdminRoute>
                      }
                    />

                    {/* ───── Shipper (protected) ───── */}
                    <Route
                      path="/shipper/dashboard"
                      element={
                        <ShipperRoute>
                          <ShipperDashboardPage />
                        </ShipperRoute>
                      }
                    />
                    <Route
                      path="/shipper/orders"
                      element={
                        <ShipperRoute>
                          <AssignedOrdersPage />
                        </ShipperRoute>
                      }
                    />
                    <Route
                      path="/shipper/orders/:id"
                      element={
                        <ShipperRoute>
                          <OrderDetailPage />
                        </ShipperRoute>
                      }
                    />
                    <Route
                      path="/shipper/delivery-history"
                      element={
                        <ShipperRoute>
                          <DeliveryHistoryPage />
                        </ShipperRoute>
                      }
                    />
                    <Route
                      path="/shipper/profile"
                      element={
                        <ShipperRoute>
                          <ShipperProfilePage />
                        </ShipperRoute>
                      }
                    />

                    {/* ───── 404 ───── */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
              <ToastContainer position="bottom-right" theme="colored" />
            </Router>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
