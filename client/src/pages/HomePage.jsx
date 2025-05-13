import { Link } from "react-router-dom"
import { FaSearch, FaArrowRight, FaShieldAlt, FaTruck, FaMoneyBillWave } from "react-icons/fa"

const HomePage = () => {
  // Sample featured products
  const featuredProducts = [
    {
      id: "1",
      name: "Vintage Victorian Chair",
      price: 1200,
      image: "/vintage.svg.png?height=300&width=300",
      category: "Furniture",
    },
    {
      id: "2",
      name: "Antique Brass Telescope",
      price: 850,
      image: "/brass-telescope.svg.png?height=300&width=300",
      category: "Collectibles",
    },
    {
      id: "3",
      name: "19th Century Oil Painting",
      price: 3200,
      image: "/oil-painting.svg.png?height=100&width=100",
      category: "Art",
    },
    {
      id: "4",
      name: "Art Deco Table Lamp",
      price: 750,
      image: "/lamp.svg.png?height=300&width=300",
      category: "Lighting",
    },
  ]

  // Sample categories
  const categories = [
    { id: "1", name: "Furniture", image: "/furniture.svg.png?height=200&width=200" },
    { id: "2", name: "Art", image: "/antique-arts.svg.png?height=200&width=200" },
    { id: "3", name: "Jewelry", image: "/jewelary.svg.png?height=200&width=200" },
    { id: "4", name: "Collectibles", image: "/collectibles.svg.png?height=200&width=200" },
    { id: "5", name: "Lighting", image: "/lighting.svg.png?height=200&width=200" },
    { id: "6", name: "Rugs & Textiles", image: "/rugs.svg.png?height=200&width=200" },
  ]

  // Sample testimonials
  const testimonials = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Collector",
      content:
        "Antiquitas has transformed how I discover rare antiques. The verification process gives me confidence in every purchase.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Interior Designer",
      content:
        "As a designer, I rely on authentic period pieces. Antiquitas is my go-to source for verified antiques that tell a story.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "3",
      name: "Amina Patel",
      role: "Seller",
      content:
        "Selling my family heirlooms was a difficult decision, but Antiquitas made the process respectful and rewarding.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Discover Authentic Antiques with History and Character
            </h1>
            <p className="text-xl mb-8">
              Explore our curated collection of verified antiques from trusted sellers around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-md text-lg font-medium transition-colors"
              >
                Explore Collection
              </Link>
              <Link
                to="/register"
                className="bg-white hover:bg-gray-100 text-primary-800 py-3 px-6 rounded-md text-lg font-medium transition-colors"
              >
                Join Antiquitas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <form className="flex items-center">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search for antiques..."
                  className="w-full p-4 pr-12 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-r-md transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Featured Antiques</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of exceptional antiques, each with its own unique history and character.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Link to={`/products/${product.id}`}>
                  <div className="relative pb-[75%] overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-primary-600 font-medium mb-1">{product.category}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary-700">${product.price.toLocaleString()}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
            >
              View All Products <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse collection of antiques organized by categories to find exactly what you're looking
              for.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative pb-[100%] overflow-hidden">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <h3 className="text-white text-lg font-medium">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img
                src="/about.svg.png?height=400&width=600"
                alt="About Antiquitas"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif font-bold mb-4">About Antiquitas</h2>
              <p className="text-gray-600 mb-6">
                Antiquitas is dedicated to preserving cultural heritage by creating a trusted marketplace for authentic
                antiques. We connect passionate collectors with verified sellers, ensuring that each piece's history and
                value are properly recognized and documented.
              </p>
              <p className="text-gray-600 mb-6">
                Our platform aims to digitize the traditionally offline antique market, making it accessible to
                enthusiasts worldwide while maintaining the highest standards of authenticity and trust.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
              >
                Learn More About Us <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Why Choose Antiquitas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to creating a trusted marketplace for authentic antiques with features designed to protect
              both buyers and sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Authenticity</h3>
              <p className="text-gray-600">
                Every antique undergoes a rigorous verification process by our team of experts to ensure authenticity.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTruck className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Shipping</h3>
              <p className="text-gray-600">
                Our specialized shipping partners ensure your valuable antiques arrive safely and securely.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Buyer Protection</h3>
              <p className="text-gray-600">
                Shop with confidence knowing that all purchases are covered by our comprehensive buyer protection
                policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">What Our Community Says</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from collectors, sellers, and antique enthusiasts who are part of our growing community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">Become a Seller on Antiquitas</h2>
            <p className="text-xl mb-8">
              Join our community of trusted sellers and share your antique treasures with passionate collectors
              worldwide.
            </p>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-primary-800 py-3 px-8 rounded-md text-lg font-medium transition-colors inline-block"
            >
              Start Selling Today
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter to receive updates on new arrivals, special offers, and antique collecting
              tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
