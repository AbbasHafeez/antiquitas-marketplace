"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaStar, FaUser } from "react-icons/fa";
import moment from "moment";

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(`/api/reviews/product/${productId}`);
        if (!cancelled) {
          // ensure we always have an array
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // endpoint not found or no reviews yet → empty list
          if (!cancelled) setReviews([]);
        } else {
          if (!cancelled) setError("Failed to load reviews");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {review.user.avatar ? (
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <FaUser className="text-gray-500" />
                </div>
              )}
              <div>
                <h4 className="font-medium">{review.user.name}</h4>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < review.rating ? "text-yellow-500" : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm ml-2">
                    {moment(review.createdAt).format("MMMM D, YYYY")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h5 className="font-medium mb-1">{review.title}</h5>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
