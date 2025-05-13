// client/src/pages/admin/ProductDetail.jsx
"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheck, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(res.data);
      } catch {
        toast.error("Could not load product");
        navigate("/admin/verify");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, navigate]);

  const handleDecision = async (approved) => {
    try {
      const url = approved
        ? `/api/admin/products/${id}/verify`
        : `/api/admin/products/${id}/reject`;
      await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast[approved ? "success" : "info"](
        approved ? "Approved!" : "Rejected!"
      );
      navigate("/admin/verify");
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <p>Loading…</p>;

  // Image fallback
  const imgSrc =
    Array.isArray(product.images) && product.images.length
      ? product.images[0]
      : "/images/default.png";

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-600 hover:underline flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Back to list
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Left: Image */}
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />

          {/* Right: Header, Price, Details, Description */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-2xl text-brown-800 font-semibold mb-4">
              ${product.price.toFixed(2)}
            </div>

            {/* Product Details in two columns */}
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ul className="space-y-1">
                <li>
                  <span className="font-medium">Age:</span> {product.age} years
                </li>
                <li>
                  <span className="font-medium">Origin:</span> {product.origin}
                </li>
                <li>
                  <span className="font-medium">Condition:</span>{" "}
                  {product.condition}
                </li>
              </ul>
              <ul className="space-y-1">
                <li>
                  <span className="font-medium">Category:</span>{" "}
                  {product.category.name}
                </li>
                <li>
                  <span className="font-medium">Seller:</span>{" "}
                  {product.seller.name}
                </li>
                <li>
                  <span className="font-medium">Availability:</span>{" "}
                  {product.availability || "In Stock"}
                </li>
              </ul>
            </div>

            {/* Description */}
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Approve / Reject Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => handleDecision(true)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex justify-center items-center"
              >
                <FaCheck className="mr-2" /> Approve
              </button>
              <button
                onClick={() => handleDecision(false)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex justify-center items-center"
              >
                <FaTimesCircle className="mr-2" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
