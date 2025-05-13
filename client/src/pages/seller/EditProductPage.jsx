"use client";

import { useEffect, useState }   from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup          from "yup";
import axios             from "axios";
import { toast }         from "react-toastify";
import ReactQuill        from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaUpload, FaTrash, FaSpinner } from "react-icons/fa";

/* ─── NEW ─── */
import LocationPicker from "../../components/common/LocationPicker"; // adjust if path differs

/* -------------------------------------------------------------------------- */
/*  helpers                                                                   */
/* -------------------------------------------------------------------------- */
const toArray = (d) => (Array.isArray(d) ? d : []);
const isValidMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

/* -------------------------------------------------------------------------- */
/*  validation schema                                                         */
/* -------------------------------------------------------------------------- */
const validationSchema = Yup.object({
  name       : Yup.string().required("Product name is required"),
  description: Yup.string().required("Description is required"),
  price      : Yup.number().positive().required("Price is required"),
  category   : Yup.string().required("Category is required"),
  age        : Yup.number().positive().required("Age is required"),
  origin     : Yup.string().required("Origin is required"),
  condition  : Yup.string().required("Condition is required"),
});

/* ========================================================================== */
/*  COMPONENT                                                                 */
/* ========================================================================== */
const EditProductPage = () => {
  const { id }   = useParams();
  const nav      = useNavigate();

  const [initialValues, setInitial]   = useState(null);
  const [categories, setCategories]   = useState([]);
  const [uploaded,   setUploaded]     = useState([]);      // [{url, public_id?}]
  const [loading,    setLoading]      = useState(true);
  const [uploading,  setUploading]    = useState(false);

  /* ─── NEW ─── coords state */
  const [coords, setCoords] = useState(null); // {lat,lng}

  /* ---------------------------------------------------------------------- */
  /*  Fetch product + categories                                            */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const fetchProductAndCategories = async () => {
      if (!isValidMongoId(id)) {
        toast.error("Invalid product ID");
        return nav("/seller/dashboard", { replace: true });
      }

      try {
        const [{ data: prod }, { data: cats }] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get("/api/categories"),
        ]);

        /* pre-fill form */
        setInitial({
          name         : prod.name,
          description  : prod.description,
          price        : prod.price,
          category     : prod.category?._id || "",
          age          : prod.age,
          origin       : prod.origin,
          condition    : prod.condition,
          isAvailable  : prod.isAvailable,
          additionalInfo: prod.additionalInfo ?? "",
        });
        setUploaded(toArray(prod.images).map((url) => ({ url })));
        setCategories(toArray(cats));

        /* ─── NEW ─── preload coords if product has location */
        if (prod.location?.coordinates?.length === 2) {
          const [lng, lat] = prod.location.coordinates;
          setCoords({ lat, lng });
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to load product data"
        );
        nav("/seller/dashboard", { replace: true });
      }
    };

    fetchProductAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------------------------------------------------------------------- */
  /*  Image upload                                                           */
  /* ---------------------------------------------------------------------- */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploaded.length > 5) {
      return toast.error("You can upload a maximum of 5 images");
    }

    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const { data } = await axios.post("/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploaded((prev) => [...prev, ...toArray(data)]);
      toast.success("Images uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) =>
    setUploaded((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------------------------------------------------------------- */
  /*  Submit                                                                 */
  /* ---------------------------------------------------------------------- */
  const onSubmit = async (values, { setSubmitting }) => {
    if (uploaded.length === 0) {
      toast.error("At least one image is required");
      return setSubmitting(false);
    }

    /* ─── NEW ─── require coords */
    if (!coords) {
      toast.error("Please select a pickup/viewing location on the map");
      return setSubmitting(false);
    }

    try {
      await axios.put(`/api/products/${id}`, {
        ...values,
        images: uploaded.map((i) => i.url),
        location: {
          type: "Point",
          coordinates: [coords.lng, coords.lat], // [lng,lat] for Mongo
        },
      });
      toast.success("Product updated");
      nav("/seller/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  Loading state                                                         */
  /* ---------------------------------------------------------------------- */
  if (loading || !initialValues) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-3xl text-primary-600" />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">
              {/* ───────────────── form fields (same as AddProduct) ───────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Name*
                  </label>
                  <Field
                    name="name"
                    className="w-full p-2 border rounded-md"
                    placeholder="Name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                {/* price */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price ($)*
                  </label>
                  <Field
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    className="w-full p-2 border rounded-md"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                {/* category */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category*
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                {/* age */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Age (years)*
                  </label>
                  <Field
                    type="number"
                    min="0"
                    name="age"
                    className="w-full p-2 border rounded-md"
                  />
                  <ErrorMessage
                    name="age"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                {/* origin */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Origin/Country*
                  </label>
                  <Field
                    name="origin"
                    className="w-full p-2 border rounded-md"
                  />
                  <ErrorMessage
                    name="origin"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                {/* condition */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Condition*
                  </label>
                  <Field
                    as="select"
                    name="condition"
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </Field>
                </div>
                {/* availability */}
                <div className="flex items-center mt-6 space-x-2">
                  <Field
                    type="checkbox"
                    name="isAvailable"
                    className="h-4 w-4 text-primary-600"
                  />
                  <label className="text-sm">Available for Sale</label>
                </div>
              </div>

              {/* description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description*
                </label>
                <ReactQuill
                  theme="snow"
                  value={values.description}
                  onChange={(c) => setFieldValue("description", c)}
                  className="mb-12"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* additional info */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Information
                </label>
                <Field
                  as="textarea"
                  rows="3"
                  name="additionalInfo"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* image upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Images* (max 5)
                </label>

                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md">
                  <input
                    id="imgUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading || uploaded.length >= 5}
                  />
                  <label
                    htmlFor="imgUpload"
                    className={`flex flex-col items-center cursor-pointer ${
                      uploaded.length >= 5 && "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {uploading ? (
                      <FaSpinner className="animate-spin text-3xl text-primary-600 mb-2" />
                    ) : (
                      <FaUpload className="text-3xl text-primary-600 mb-2" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploading
                        ? "Uploading..."
                        : uploaded.length >= 5
                        ? "Max images reached"
                        : "Click to upload"}
                    </span>
                  </label>
                </div>

                {!!uploaded.length && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                    {uploaded.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt=""
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
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
                <label className="block text-sm font-medium mb-1">
                  Pickup / Viewing Location*
                </label>
                <LocationPicker value={coords} onChange={setCoords} height={350} />
              </div>

              {/* actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => nav("/seller/dashboard")}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Saving…
                    </span>
                  ) : (
                    "Save Changes"
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

export default EditProductPage;
