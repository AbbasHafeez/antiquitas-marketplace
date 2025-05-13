"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useLocation }                            from "react-router-dom";
import axios                                      from "axios";
import { toast }                                  from "react-toastify";
import ProductCard                                from "../../components/buyer/ProductCard";
import { FaFilter, FaTimes, FaSearch }            from "react-icons/fa";
import { AuthContext }                            from "../../context/AuthContext";

// always return an array
const toArray = (d) => (Array.isArray(d) ? d : []);

export default function ProductsPage() {
  const { token } = useContext(AuthContext);
  const location  = useLocation();
  const qp        = new URLSearchParams(location.search);

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [wishlist,    setWishlist]    = useState([]); // array of product IDs
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search  : qp.get("search")   || "",
    category: qp.get("category") || "",
    minPrice: "",
    maxPrice: "",
    sortBy  : "featured",
    verified: false,
  });

  /* ─── NEW: geo‑filter state ─── */
  const [nearMe, setNearMe]     = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [coords, setCoords]     = useState(null); // {lat,lng}

  // Use a ref to block duplicate toggles for the same product
  const toggling = useRef(new Set());

  /* ─── NEW: request browser geolocation ─── */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setNearMe(true);
      },
      () => toast.error("Unable to retrieve your location"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        /* ─── build search params ─── */
        const params = new URLSearchParams();
        if (filters.search)   params.append("search", filters.search);
        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.sortBy)   params.append("sortBy", filters.sortBy);
        if (filters.verified) params.append("verified", "true");

        /* ─── NEW: add geo params when active ─── */
        if (
          nearMe &&
          coords &&
          Number.isFinite(coords.lat) &&
          Number.isFinite(coords.lng)
        ) {
          params.append("lat", coords.lat);
          params.append("lng", coords.lng);
          params.append("radiusKm", radiusKm);
        }

        const [prodRes, catRes] = await Promise.all([
          axios.get(`/api/products?${params.toString()}`),
          axios.get("/api/categories"),
        ]);

        setProducts(toArray(prodRes.data.products ?? prodRes.data));
        setCategories(toArray(catRes.data));

        // ─── fetch wishlist for logged-in user ───
        try {
          const wlRes = await axios.get("/api/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const items = Array.isArray(wlRes.data.items)
            ? wlRes.data.items
            : Array.isArray(wlRes.data)
            ? wlRes.data
            : [];
          setWishlist(items.map((i) => i.product._id));
        } catch {
          setWishlist([]); // guest or error
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products or categories");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.verified,
    /* ─── NEW deps ─── */
    nearMe,
    radiusKm,
    coords,
    token,
  ]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search:   "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy:   "featured",
      verified: false,
    });
    /* ─── NEW: reset geo filters ─── */
    setNearMe(false);
    setCoords(null);
  };

  const toggleWishlist = async (productId) => {
    // block if already in-flight
    if (toggling.current.has(productId)) return;
    toggling.current.add(productId);

    const inWL = wishlist.includes(productId);
    try {
      if (inWL) {
        await axios.delete(`/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist((wl) => wl.filter((id) => id !== productId));
        toast.info("Removed from wishlist");
      } else {
        await axios.post(
          "/api/wishlist",
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist((wl) => [...wl, productId]);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          `Could not ${inWL ? "remove from" : "add to"} wishlist`
      );
    } finally {
      toggling.current.delete(productId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"/>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ─── Filters Panel ─── */}
        <div
          className={`w-full md:w-1/4 bg-white p-4 rounded shadow ${
            showFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">
              Clear All
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex items-center border rounded overflow-hidden">
              <input
                type="text"
                name="search"
                placeholder="Search antiques..."
                className="flex-1 px-4 py-2"
                value={filters.search}
                onChange={handleFilterChange}
              />
              <button className="px-4 bg-primary-600 text-white">
                <FaSearch />
              </button>
            </div>
          </form>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Category</h3>
            <label className="block mb-2">
              <input
                type="radio"
                name="category"
                value=""
                checked={!filters.category}
                onChange={handleFilterChange}
                className="mr-2"
              />
              All
            </label>
            {categories.map((c) => (
              <label key={c._id} className="block mb-1">
                <input
                  type="radio"
                  name="category"
                  value={c._id}
                  checked={filters.category === c._id}
                  onChange={handleFilterChange}
                  className="mr-2"
                />
                {c.name}
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Price</h3>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                className="w-full p-2 border rounded"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                className="w-full p-2 border rounded"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Sort By</h3>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low–High</option>
              <option value="price-high">Price: High–Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="verified"
              checked={filters.verified}
              onChange={handleFilterChange}
              className="mr-2"
            />
            Verified Only
          </label>

          {/* ─── NEW: Near‑me distance filter ─── */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                id="nearMe"
                type="checkbox"
                checked={nearMe}
                onChange={(e) => {
                  if (e.target.checked && !coords) requestLocation();
                  else setNearMe(e.target.checked);
                }}
                className="h-4 w-4 text-primary-600"
              />
              <label htmlFor="nearMe" className="text-sm">Show items near me</label>
            </div>

            {nearMe && (
              <div>
                <label htmlFor="radiusKm" className="block text-xs text-gray-600">
                  Within {radiusKm} km
                </label>
                <input
                  id="radiusKm"
                  type="range"
                  min="1"
                  max="100"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters(false)}
            className="block w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 mt-6"
          >
            Apply
          </button>
        </div>

        {/* ─── Products Grid ─── */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <button
              className="md:hidden flex items-center bg-primary-600 text-white px-4 py-2 rounded mb-4"
              onClick={() => setShowFilters((v) => !v)}
            >
              {showFilters ? <FaTimes className="mr-2"/> : <FaFilter className="mr-2"/>}
              Filters
            </button>

            <h1 className="text-2xl font-bold">
              {filters.category
                ? categories.find((c) => c._id === filters.category)?.name ?? "Products"
                : "All Products"}
            </h1>

            <span className="text-gray-600">
              {products.length} result{products.length !== 1 && "s"}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded text-center">
              <h3 className="text-xl mb-2">No products found</h3>
              <p className="text-gray-600">Try different filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  inWishlist={wishlist.includes(prod._id)}
                  onWishlistToggle={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
