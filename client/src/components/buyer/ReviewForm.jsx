"use client"

import { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import axios from "axios"
import { toast } from "react-toastify"
import { FaStar } from "react-icons/fa"

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [hoveredRating, setHoveredRating] = useState(0)

  const validationSchema = Yup.object({
    rating: Yup.number().required("Rating is required").min(1, "Please select a rating"),
    title: Yup.string().required("Title is required").max(100, "Title cannot exceed 100 characters"),
    comment: Yup.string().required("Review comment is required").max(500, "Comment cannot exceed 500 characters"),
  })

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post("/api/reviews", {
        product: productId,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
      })

      toast.success("Review submitted successfully")
      resetForm()
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Write Your Review</h3>

      <Formik
        initialValues={{
          rating: 0,
          title: "",
          comment: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating*</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFieldValue("rating", star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-2xl focus:outline-none"
                  >
                    <FaStar
                      className={`${star <= (hoveredRating || values.rating) ? "text-yellow-500" : "text-gray-300"}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {values.rating > 0 ? `${values.rating} out of 5 stars` : "Select a rating"}
                </span>
              </div>
              <ErrorMessage name="rating" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Review Title*
              </label>
              <Field
                type="text"
                name="title"
                id="title"
                className="w-full p-2 border rounded-md"
                placeholder="Summarize your experience"
              />
              <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Review Comment*
              </label>
              <Field
                as="textarea"
                name="comment"
                id="comment"
                rows="4"
                className="w-full p-2 border rounded-md"
                placeholder="Share your experience with this product"
              />
              <ErrorMessage name="comment" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default ReviewForm
