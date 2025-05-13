"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";          // v2 (no findDOMNode warning)
import "react-quill/dist/quill.snow.css";
import { FaUpload, FaTrash, FaSpinner } from "react-icons/fa";

/* ─── NEW ─── */
import LocationPicker from "../../components/common/LocationPicker"; // adjust alias if you don't use @/ alias

/* helper – always work with arrays */
const arr = (d) => (Array.isArray(d) ? d : []);

const AddProductPage = () => {
  const navigate = useNavigate();

  /* ───────── state ───────── */
  const [categories, setCategories] = useState([]);
  const [uploadedImages, setImages] = useState([]); // [{url:"/uploads/…"}]
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ─── NEW ─── selected map coords */
  const [coords, setCoords] = useState(null); // {lat,lng}

  /* ───────── fetch categories ───────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/categories");
        setCategories(arr(data));
      } catch {
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  /* ───────── image upload ───────── */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + uploadedImages.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const { data } = await axios.post("/api/upload/product", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      /* backend returns { files: [ '/uploads/…', … ] } */
      setImages((prev) => [...prev, ...data.files.map((url) => ({ url }))]);
      toast.success("Images uploaded");
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  /* ───────── form schema ───────── */
  const schema = Yup.object({
    name: Yup.string().required("Product name is required"),
    description: Yup.string().required("Description is required"),
    price: Yup.number().positive().required(),
    category: Yup.string().required(),
    age: Yup.number().positive().required(),
    origin: Yup.string().required(),
    condition: Yup.string().required(),
  });

  /* ───────── submit ───────── */
  const handleSubmit = async (values, helpers) => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image");
      return helpers.setSubmitting(false);
    }

    /* ─── NEW ─── require map coords */
    if (!coords) {
      toast.error("Please select a pickup/viewing location on the map");
      return helpers.setSubmitting(false);
    }

    setLoading(true);
    try {
      await axios.post("/api/products", {
        ...values,
        images: uploadedImages.map((i) => i.url),
        /* ─── NEW ─── GeoJSON Point for backend */
        location: {
          type: "Point",
          coordinates: [coords.lng, coords.lat], // Mongo expects [lng,lat]
        },
      });
      toast.success("Product added");
      helpers.resetForm();
      setImages([]);
      setCoords(null);
      navigate("/seller/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
      helpers.setSubmitting(false);
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Antique Product</h1>

        <Formik
          initialValues={{
            name: "",
            description: "",
            price: "",
            category: "",
            age: "",
            origin: "",
            condition: "good",
            isAvailable: true,
            additionalInfo: "",
          }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-6">
              {/* --- two-column grid --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* name */}
                <FieldBlock
                  name="name"
                  label="Product Name*"
                  placeholder="Enter product name"
                />
                {/* price */}
                <FieldBlock
                  type="number"
                  name="price"
                  label="Price ($)*"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
                {/* category */}
                <div>
                  <Label text="Category*" htmlFor="category" />
                  <Field
                    as="select"
                    name="category"
                    id="category"
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Field>
                  <Error name="category" />
                </div>
                {/* age */}
                <FieldBlock
                  type="number"
                  name="age"
                  label="Age (years)*"
                  placeholder="Enter age in years"
                  min="0"
                />
                {/* origin */}
                <FieldBlock
                  name="origin"
                  label="Origin/Country*"
                  placeholder="Enter country of origin"
                />
                {/* condition */}
                <div>
                  <Label text="Condition*" htmlFor="condition" />
                  <Field
                    as="select"
                    name="condition"
                    id="condition"
                    className="w-full p-2 border rounded-md"
                  >
                    {["excellent", "good", "fair", "poor"].map((v) => (
                      <option key={v}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </option>
                    ))}
                  </Field>
                  <Error name="condition" />
                </div>
                {/* available */}
                <div className="flex items-center space-x-2 mt-6">
                  <Field
                    type="checkbox"
                    name="isAvailable"
                    id="isAvailable"
                    className="h-4 w-4 text-primary-600"
                  />
                  <label htmlFor="isAvailable" className="text-sm">
                    Available for Sale
                  </label>
                </div>
              </div>

              {/* description – quill */}
              <div>
                <Label text="Description*" />
                <ReactQuill
                  theme="snow"
                  value={values.description}
                  onChange={(v) => setFieldValue("description", v)}
                  className="h-40 mb-12"
                />
                <Error name="description" />
              </div>

              {/* additionalInfo */}
              <div>
                <Label text="Additional Information" htmlFor="additionalInfo" />
                <Field
                  as="textarea"
                  name="additionalInfo"
                  id="additionalInfo"
                  rows="3"
                  placeholder="Enter any additional details, history, or provenance"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* images */}
              <div>
                <Label text="Product Images* (Max 5)" />
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md">
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading || uploadedImages.length >= 5}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center cursor-pointer ${
                      uploadedImages.length >= 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {uploading ? (
                      <FaSpinner className="animate-spin text-primary-600 text-3xl mb-2" />
                    ) : (
                      <FaUpload className="text-primary-600 text-3xl mb-2" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploading
                        ? "Uploading…"
                        : uploadedImages.length >= 5
                        ? "Maximum images reached"
                        : "Click to upload images"}
                    </span>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── NEW ─── Location Picker */}
              <div>
                <Label text="Pickup / Viewing Location*" />
                <LocationPicker value={coords} onChange={setCoords} height={350} />
              </div>

              {/* buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/seller/dashboard")}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading || uploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting || loading ? (
                    <Spinner text="Submitting…" />
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

/* ───────── small helper components ───────── */
const Label = ({ text, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
    {text}
  </label>
);

const Error = ({ name }) => (
  <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
);

const FieldBlock = (props) => (
  <div>
    <Label text={props.label} htmlFor={props.name} />
    <Field {...props} className="w-full p-2 border rounded-md" />
    <Error name={props.name} />
  </div>
);

const Spinner = ({ text }) => (
  <span className="flex items-center">
    <FaSpinner className="animate-spin mr-2" /> {text}
  </span>
);

export default AddProductPage;
