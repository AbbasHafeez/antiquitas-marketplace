"use client"

import { ChevronDown, ChevronRight, Folder, FileText } from "lucide-react"
import { useState } from "react"

// Custom TreeNode component to replace the missing FolderTree
const TreeNode = ({ name, children, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1)
  const hasChildren = children && children.length > 0

  return (
    <div className="font-mono">
      <div
        className={`flex items-center py-1 hover:bg-muted/50 rounded cursor-pointer ${level === 0 ? "font-bold" : ""}`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div style={{ marginLeft: `${level * 16}px` }} className="flex items-center">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )
          ) : (
            <span className="w-5" />
          )}

          {hasChildren ? (
            <Folder className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
          )}
          <span>{name}</span>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div>
          {children.map((child, index) => (
            <TreeNode key={`${child.name}-${index}`} name={child.name} children={child.children} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectStructure() {
  const projectStructure = [
    {
      name: "antiquitas-marketplace",
      children: [
        {
          name: "client",
          children: [
            {
              name: "node_modules",
            },
            {
              name: "public",
              children: [
                { name: "favicon.ico" },
                { name: "index.html" },
                { name: "manifest.json" },
                { name: "robots.txt" },
                {
                  name: "assets",
                  children: [{ name: "images" }, { name: "icons" }],
                },
              ],
            },
            {
              name: "src",
              children: [
                {
                  name: "components",
                  children: [
                    {
                      name: "admin",
                      children: [
                        { name: "Dashboard.jsx" },
                        { name: "UserManagement.jsx" },
                        { name: "ProductApproval.jsx" },
                        { name: "ShipmentPartners.jsx" },
                        { name: "Analytics.jsx" },
                        { name: "CategoryManagement.jsx" },
                        { name: "DisputeCenter.jsx" },
                      ],
                    },
                    {
                      name: "auth",
                      children: [
                        { name: "Login.jsx" },
                        { name: "Register.jsx" },
                        { name: "ForgotPassword.jsx" },
                        { name: "ResetPassword.jsx" },
                      ],
                    },
                    {
                      name: "buyer",
                      children: [
                        { name: "ProductBrowser.jsx" },
                        { name: "ProductDetails.jsx" },
                        { name: "Cart.jsx" },
                        { name: "Checkout.jsx" },
                        { name: "OrderHistory.jsx" },
                        { name: "Wishlist.jsx" },
                        { name: "ReviewForm.jsx" },
                      ],
                    },
                    {
                      name: "seller",
                      children: [
                        { name: "Dashboard.jsx" },
                        { name: "ProductListing.jsx" },
                        { name: "OrderManagement.jsx" },
                        { name: "InventoryManagement.jsx" },
                        { name: "EarningsReport.jsx" },
                      ],
                    },
                    {
                      name: "shipper",
                      children: [
                        { name: "Dashboard.jsx" },
                        { name: "OrderAssignment.jsx" },
                        { name: "TrackingUpdates.jsx" },
                        { name: "DeliveryProof.jsx" },
                        { name: "DeliveryHistory.jsx" },
                      ],
                    },
                    {
                      name: "common",
                      children: [
                        { name: "Navbar.jsx" },
                        { name: "Footer.jsx" },
                        { name: "Sidebar.jsx" },
                        { name: "ProductCard.jsx" },
                        { name: "SearchBar.jsx" },
                        { name: "Filters.jsx" },
                        { name: "Pagination.jsx" },
                        { name: "Modal.jsx" },
                        { name: "Loader.jsx" },
                        { name: "Alert.jsx" },
                        { name: "Rating.jsx" },
                        { name: "ImageGallery.jsx" },
                      ],
                    },
                    {
                      name: "ui",
                      children: [
                        { name: "Button.jsx" },
                        { name: "Input.jsx" },
                        { name: "Select.jsx" },
                        { name: "Checkbox.jsx" },
                        { name: "Badge.jsx" },
                        { name: "Card.jsx" },
                        { name: "Dropdown.jsx" },
                        { name: "Tabs.jsx" },
                      ],
                    },
                  ],
                },
                {
                  name: "context",
                  children: [
                    { name: "AuthContext.js" },
                    { name: "CartContext.js" },
                    { name: "NotificationContext.js" },
                    { name: "ThemeContext.js" },
                    { name: "WishlistContext.js" },
                  ],
                },
                {
                  name: "pages",
                  children: [
                    { name: "HomePage.jsx" },
                    { name: "AboutPage.jsx" },
                    { name: "ContactPage.jsx" },
                    { name: "NotFoundPage.jsx" },
                    {
                      name: "admin",
                      children: [
                        { name: "AdminDashboardPage.jsx" },
                        { name: "UserManagementPage.jsx" },
                        { name: "ProductApprovalPage.jsx" },
                        { name: "ShipmentPartnersPage.jsx" },
                        { name: "AnalyticsPage.jsx" },
                        { name: "CategoryManagementPage.jsx" },
                        { name: "DisputeCenterPage.jsx" },
                      ],
                    },
                    {
                      name: "auth",
                      children: [
                        { name: "LoginPage.jsx" },
                        { name: "RegisterPage.jsx" },
                        { name: "ForgotPasswordPage.jsx" },
                        { name: "ResetPasswordPage.jsx" },
                      ],
                    },
                    {
                      name: "buyer",
                      children: [
                        { name: "ProductsPage.jsx" },
                        { name: "ProductDetailsPage.jsx" },
                        { name: "CartPage.jsx" },
                        { name: "CheckoutPage.jsx" },
                        { name: "OrderHistoryPage.jsx" },
                        { name: "WishlistPage.jsx" },
                        { name: "ProfilePage.jsx" },
                      ],
                    },
                    {
                      name: "seller",
                      children: [
                        { name: "SellerDashboardPage.jsx" },
                        { name: "AddProductPage.jsx" },
                        { name: "EditProductPage.jsx" },
                        { name: "OrdersPage.jsx" },
                        { name: "EarningsPage.jsx" },
                        { name: "SellerProfilePage.jsx" },
                      ],
                    },
                    {
                      name: "shipper",
                      children: [
                        { name: "ShipperDashboardPage.jsx" },
                        { name: "AssignedOrdersPage.jsx" },
                        { name: "DeliveryHistoryPage.jsx" },
                        { name: "ShipperProfilePage.jsx" },
                      ],
                    },
                  ],
                },
                {
                  name: "utils",
                  children: [
                    { name: "api.js" },
                    { name: "auth.js" },
                    { name: "formatters.js" },
                    { name: "validators.js" },
                    { name: "helpers.js" },
                    { name: "constants.js" },
                  ],
                },
                {
                  name: "hooks",
                  children: [
                    { name: "useAuth.js" },
                    { name: "useCart.js" },
                    { name: "useForm.js" },
                    { name: "useNotification.js" },
                    { name: "useLocalStorage.js" },
                    { name: "useWishlist.js" },
                  ],
                },
                {
                  name: "assets",
                  children: [{ name: "images" }, { name: "icons" }, { name: "styles" }],
                },
                { name: "App.js" },
                { name: "App.css" },
                { name: "index.js" },
                { name: "index.css" },
                { name: "reportWebVitals.js" },
                { name: "setupTests.js" },
              ],
            },
            { name: ".gitignore" },
            { name: "package.json" },
            { name: "package-lock.json" },
            { name: "README.md" },
            { name: "tailwind.config.js" },
            { name: "jsconfig.json" },
          ],
        },
        {
          name: "server",
          children: [
            {
              name: "config",
              children: [
                { name: "db.js" },
                { name: "passport.js" },
                { name: "cloudinary.js" },
                { name: "email.js" },
                { name: "payment.js" },
              ],
            },
            {
              name: "controllers",
              children: [
                { name: "authController.js" },
                { name: "userController.js" },
                { name: "productController.js" },
                { name: "orderController.js" },
                { name: "reviewController.js" },
                { name: "categoryController.js" },
                { name: "shipmentController.js" },
                { name: "paymentController.js" },
                { name: "adminController.js" },
                { name: "notificationController.js" },
              ],
            },
            {
              name: "middleware",
              children: [
                { name: "auth.js" },
                { name: "roleCheck.js" },
                { name: "errorHandler.js" },
                { name: "fileUpload.js" },
                { name: "rateLimiter.js" },
                { name: "validator.js" },
                { name: "logger.js" },
              ],
            },
            {
              name: "models",
              children: [
                { name: "User.js" },
                { name: "Product.js" },
                { name: "Order.js" },
                { name: "Review.js" },
                { name: "Category.js" },
                { name: "Shipment.js" },
                { name: "Payment.js" },
                { name: "Notification.js" },
                { name: "Wishlist.js" },
                { name: "Dispute.js" },
              ],
            },
            {
              name: "routes",
              children: [
                { name: "authRoutes.js" },
                { name: "userRoutes.js" },
                { name: "productRoutes.js" },
                { name: "orderRoutes.js" },
                { name: "reviewRoutes.js" },
                { name: "categoryRoutes.js" },
                { name: "shipmentRoutes.js" },
                { name: "paymentRoutes.js" },
                { name: "adminRoutes.js" },
                { name: "notificationRoutes.js" },
              ],
            },
            {
              name: "utils",
              children: [
                { name: "helpers.js" },
                { name: "validators.js" },
                { name: "emailTemplates.js" },
                { name: "constants.js" },
                { name: "formatters.js" },
              ],
            },
            {
              name: "services",
              children: [
                { name: "emailService.js" },
                { name: "paymentService.js" },
                { name: "cloudinaryService.js" },
                { name: "notificationService.js" },
                { name: "shipmentService.js" },
              ],
            },
            {
              name: "sockets",
              children: [{ name: "socketManager.js" }, { name: "chatHandler.js" }, { name: "notificationHandler.js" }],
            },
            { name: "node_modules" },
            { name: ".env" },
            { name: ".gitignore" },
            { name: "package.json" },
            { name: "package-lock.json" },
            { name: "server.js" },
            { name: "README.md" },
          ],
        },
        {
          name: "shared",
          children: [
            {
              name: "types",
              children: [
                { name: "index.d.ts" },
                { name: "user.d.ts" },
                { name: "product.d.ts" },
                { name: "order.d.ts" },
              ],
            },
            {
              name: "constants",
              children: [{ name: "roles.js" }, { name: "statuses.js" }, { name: "categories.js" }],
            },
            {
              name: "utils",
              children: [{ name: "validators.js" }, { name: "formatters.js" }],
            },
          ],
        },
        { name: ".gitignore" },
        { name: "README.md" },
        { name: "package.json" },
        { name: "docker-compose.yml" },
        { name: ".env.example" },
      ],
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Antiquitas - Antique Marketplace Project Structure</h1>
      <div className="border rounded-lg p-4 bg-card">
        {projectStructure.map((item, index) => (
          <TreeNode key={`${item.name}-${index}`} name={item.name} children={item.children} />
        ))}
      </div>
    </div>
  )
}
