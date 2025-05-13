import { Link } from "react-router-dom"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            to="/products"
            className="bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 transition-colors"
          >
            Browse Antiques
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
