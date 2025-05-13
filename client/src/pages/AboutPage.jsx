import { Link } from "react-router-dom"
import { FaHistory, FaGlobe, FaUsers, FaShieldAlt, FaHandshake, FaLeaf } from "react-icons/fa"

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Eleanor Harrington",
      role: "Founder & CEO",
      image: "/harrington.svg.png?height=400&width=600",
      bio: "Antique collector with over 25 years of experience and a passion for preserving history.",
    },
    {
      name: "James Wilson",
      role: "Chief Authentication Officer",
      image: "/james.svg.png?height=400&width=600",
      bio: "Former museum curator with expertise in European and Asian antiques from the 16th-19th centuries.",
    },
    {
      name: "Sophia Chen",
      role: "Head of Operations",
      image: "/sophia.svg.png?height=400&width=600",
      bio: "Logistics expert ensuring smooth operations and secure shipping of valuable antiques worldwide.",
    },
    {
      name: "Robert Blackwell",
      role: "Technology Director",
      image: "/rober.svg.png?height=400&width=600",
      bio: "Tech innovator implementing cutting-edge solutions to enhance the antique marketplace experience.",
    },
  ]

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-24"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">About Antiquitas</h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Connecting collectors, enthusiasts, and sellers in a trusted marketplace for authentic antiques since 2015.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-serif font-bold mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Antiquitas was founded in 2015 by Eleanor Harrington, a lifelong antique collector and historian who
              recognized the need for a trusted online marketplace dedicated exclusively to authentic antiques.
            </p>
            <p className="text-gray-700 mb-4">
              What began as a small platform connecting local collectors has grown into a global marketplace with
              thousands of verified sellers and a rigorous authentication process that ensures every item's provenance
              and quality.
            </p>
            <p className="text-gray-700">
              Today, Antiquitas stands as the premier destination for antique enthusiasts, interior designers,
              collectors, and historians seeking to discover, buy, and sell pieces with historical significance and
              timeless beauty.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Antiquitas History"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">Our Values</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaHistory className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Preserving History</h3>
              <p className="text-gray-600">
                We believe in the importance of preserving historical artifacts and making them accessible to new
                generations of collectors and enthusiasts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaShieldAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Authenticity</h3>
              <p className="text-gray-600">
                We maintain the highest standards of authentication, ensuring every item sold on our platform is genuine
                and accurately represented.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaHandshake className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trust</h3>
              <p className="text-gray-600">
                We foster a community built on trust, transparency, and respect between buyers, sellers, and our
                authentication experts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaGlobe className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Community</h3>
              <p className="text-gray-600">
                We connect antique lovers across borders, creating a diverse global community united by a passion for
                history and craftsmanship.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaUsers className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Education</h3>
              <p className="text-gray-600">
                We are committed to educating our community about antiques, their history, and proper preservation
                techniques.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaLeaf className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We promote sustainable collecting by giving historical items new life and reducing the demand for newly
                manufactured goods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold mb-12 text-center">Meet Our Team</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary-600 mb-4">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Us */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Join the Antiquitas Community</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Whether you're a collector, seller, or simply appreciate the beauty and history of antiques, there's a place
            for you in our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary-700 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Create an Account
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-primary-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
