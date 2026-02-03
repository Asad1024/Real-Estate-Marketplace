import { useState, useEffect, useRef } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiCamera, HiX } from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";

const inputBase =
  "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";
const labelBase = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";
const sectionTitle = "text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (match Firebase Storage rule)
const MAX_IMAGE_SIZE_MB = 10;

const toggleGroup = (selected, onSelect, options) => (
  <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
    {options.map(({ value, label }) => (
      <button
        key={String(value)}
        type="button"
        onClick={() => onSelect(value)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          selected === value
            ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const initialForm = {
  type: "rent",
  name: "",
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  address: "",
  description: "",
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  latitude: 0,
  longitude: 0,
  images: [],
  contact: "",
};

export default function EditListing() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { listingId } = useParams();
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState(null);
  const [existingImgUrls, setExistingImgUrls] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const previewUrlsRef = useRef([]);
  const [formData, setFormData] = useState(initialForm);

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    address,
    furnished,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
    contact,
  } = formData;

  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        toast.error("Listing not found");
        navigate("/");
        return;
      }
      const data = docSnap.data();
      if (data.userRef !== auth.currentUser?.uid) {
        toast.error("You can't edit this listing");
        navigate("/");
        return;
      }
      setListing(data);
      setExistingImgUrls(data.imgUrls || []);
      setFormData({
        type: data.type || "rent",
        name: data.name || "",
        bedrooms: data.bedrooms ?? 1,
        bathrooms: data.bathrooms ?? 1,
        parking: data.parking ?? false,
        furnished: data.furnished ?? false,
        address: data.address || "",
        description: data.description || "",
        offer: data.offer ?? false,
        regularPrice: data.regularPrice ?? 0,
        discountedPrice: data.discountedPrice ?? 0,
        latitude: data.geolocation?.lat ?? 0,
        longitude: data.geolocation?.lng ?? 0,
        images: [],
        contact: data.contact || "",
      });
      setGeolocationEnabled(!!(data.address && data.geolocation));
      setLoading(false);
    }
    fetchListing();
  }, [listingId, auth.currentUser?.uid, navigate]);

  useEffect(() => {
    const files = Array.isArray(formData.images) ? formData.images : [];
    if (!files.length) {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
      setNewImagePreviews([]);
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrlsRef.current = urls;
    setNewImagePreviews(urls);
    return () => {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
    };
  }, [formData.images]);

  const onChange = (e) => {
    let boolean = null;
    if (e.target.value === "true") boolean = true;
    if (e.target.value === "false") boolean = false;
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = [];
      const tooLarge = [];
      for (const file of newFiles) {
        if (file.size > MAX_IMAGE_SIZE_BYTES) tooLarge.push(file.name);
        else validFiles.push(file);
      }
      if (tooLarge.length > 0) {
        toast.error(
          `Image${tooLarge.length > 1 ? "s" : ""} too large (max ${MAX_IMAGE_SIZE_MB}MB): ${tooLarge.slice(0, 3).join(", ")}${tooLarge.length > 3 ? "…" : ""}`
        );
      }
      if (validFiles.length > 0) {
        const maxNew = Math.max(0, 6 - existingImgUrls.length);
        setFormData((prev) => {
          const current = Array.isArray(prev.images) ? prev.images : [];
          const merged = [...current, ...validFiles].slice(0, maxNew);
          return { ...prev, images: merged };
        });
      }
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: boolean ?? e.target.value,
    }));
  };

  const removeExistingImage = (index) => {
    setExistingImgUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (offer && +discountedPrice >= +regularPrice) {
      setSaving(false);
      toast.error("Discounted price must be less than regular price");
      return;
    }
    const newImagesArray = Array.isArray(images) ? images : [];
    const hasNewImages = newImagesArray.length > 0;
    const totalImages = existingImgUrls.length + newImagesArray.length;
    if (totalImages === 0) {
      setSaving(false);
      toast.error("At least one image is required.");
      return;
    }
    if (totalImages > 6) {
      setSaving(false);
      toast.error("Maximum 6 images total. Remove some or add fewer.");
      return;
    }

    let geolocation = {};
    if (geolocationEnabled) {
      const key = process.env.REACT_APP_GEOCODE_API_KEY;
      const tryGeocode = async (addr) => {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${key}`
        );
        return res.json();
      };
      let data = await tryGeocode(address.trim());
      if (data.status === "ZERO_RESULTS" && address.trim()) {
        data = await tryGeocode(`${address.trim()}, Pakistan`);
      }
      if (data.status === "ZERO_RESULTS" && address.trim()) {
        data = await tryGeocode("Lahore, Pakistan");
      }
      if (data.results?.[0]?.geometry?.location) {
        geolocation.lat = data.results[0].geometry.location.lat;
        geolocation.lng = data.results[0].geometry.location.lng;
      } else {
        geolocation.lat = 31.5204;
        geolocation.lng = 74.3587;
      }
    } else {
      geolocation.lat = Number(latitude);
      geolocation.lng = Number(longitude);
    }

    let imgUrls = [...existingImgUrls];
    if (hasNewImages) {
      const user = auth.currentUser;
      if (!user) {
        setSaving(false);
        toast.error("You must be signed in to upload images");
        return;
      }
      const storeImage = (image) =>
        new Promise((resolve, reject) => {
          const safeName = (image.name || "image").replace(/[/\\?#*]/g, "_").slice(0, 100);
          const filename = `${user.uid}-${safeName}-${uuidv4()}`;
          const storage = getStorage();
          const storageRef = ref(storage, filename);
          const contentType = image.type?.startsWith("image/") ? image.type : "image/jpeg";
          const uploadTask = uploadBytesResumable(storageRef, image, { contentType });
          uploadTask.on("state_changed", () => {}, reject, () =>
            getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject)
          );
        });
      const uploaded = [];
      try {
        for (const image of newImagesArray) {
          const url = await storeImage(image);
          uploaded.push(url);
        }
      } catch (err) {
        console.error("Image upload error:", err);
        setSaving(false);
        const msg = err?.code === "storage/unauthorized" || err?.code === "storage/canceled"
          ? "Upload denied. Check that you're signed in and Storage rules allow uploads."
          : "Image upload failed. Check your connection and try again.";
        toast.error(msg);
        return;
      }
      imgUrls = [...existingImgUrls, ...uploaded].slice(0, 6);
    }

    const payload = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete payload.images;
    delete payload.latitude;
    delete payload.longitude;
    if (!payload.offer) delete payload.discountedPrice;

    const docRef = doc(db, "listings", listingId);
    await updateDoc(docRef, payload);
    setSaving(false);
    toast.success("Listing updated");
    navigate(`/category/${payload.type}/${listingId}`);
  };

  if (loading) return <Spinner />;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Edit listing
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Update your property details
            </p>
          </div>
          <Link
            to={`/category/${listing?.type}/${listingId}`}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            View listing →
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className={sectionTitle}>Listing type</h2>
            <div className="flex gap-2">
              {[
                { value: "sale", label: "Sale" },
                { value: "rent", label: "Rent" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: opt.value }))}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    type === opt.value
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className={sectionTitle}>Basic details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className={labelBase}>Property name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={onChange}
                  placeholder="e.g. Cozy 2BR near downtown"
                  maxLength={32}
                  minLength={10}
                  required
                  className={inputBase}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bedrooms" className={labelBase}>Bedrooms</label>
                  <input
                    type="number"
                    id="bedrooms"
                    value={bedrooms}
                    onChange={onChange}
                    min={1}
                    max={50}
                    required
                    className={`${inputBase} text-center`}
                  />
                </div>
                <div>
                  <label htmlFor="bathrooms" className={labelBase}>Bathrooms</label>
                  <input
                    type="number"
                    id="bathrooms"
                    value={bathrooms}
                    onChange={onChange}
                    min={1}
                    max={50}
                    required
                    className={`${inputBase} text-center`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <div>
                  <span className={labelBase}>Parking</span>
                  {toggleGroup(
                    parking,
                    (v) => setFormData((prev) => ({ ...prev, parking: v })),
                    [
                      { value: false, label: "No" },
                      { value: true, label: "Yes" },
                    ]
                  )}
                </div>
                <div>
                  <span className={labelBase}>Furnished</span>
                  {toggleGroup(
                    furnished,
                    (v) => setFormData((prev) => ({ ...prev, furnished: v })),
                    [
                      { value: false, label: "No" },
                      { value: true, label: "Yes" },
                    ]
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className={sectionTitle}>Location</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="geolocationEnabled"
                  checked={geolocationEnabled}
                  onChange={(e) => setGeolocationEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="geolocationEnabled" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Use address to get coordinates
                </label>
              </div>
              <div>
                <label htmlFor="address" className={labelBase}>
                  <MdLocationOn className="inline w-4 h-4 mr-1" /> Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={onChange}
                  placeholder="Street, city, country"
                  required
                  rows={2}
                  className={inputBase}
                />
              </div>
              {!geolocationEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className={labelBase}>Latitude</label>
                    <input
                      type="number"
                      id="latitude"
                      value={latitude}
                      onChange={onChange}
                      required
                      className={`${inputBase} text-center`}
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className={labelBase}>Longitude</label>
                    <input
                      type="number"
                      id="longitude"
                      value={longitude}
                      onChange={onChange}
                      required
                      className={`${inputBase} text-center`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className={sectionTitle}>Description & contact</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className={labelBase}>Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={onChange}
                  placeholder="Describe your property..."
                  required
                  rows={4}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="contact" className={labelBase}>Contact number</label>
                <input
                  type="text"
                  id="contact"
                  value={contact}
                  onChange={onChange}
                  placeholder="+92 300 1234567"
                  required
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className={sectionTitle}>Pricing</h2>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="offer"
                checked={offer}
                onChange={(e) => setFormData((prev) => ({ ...prev, offer: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="offer" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                This listing has a discount
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="regularPrice" className={labelBase}>
                  Regular price (Rs) {type === "rent" && "/ month"}
                </label>
                <input
                  type="number"
                  id="regularPrice"
                  value={regularPrice || ""}
                  onChange={onChange}
                  min={50}
                  max={400000000}
                  required
                  className={inputBase}
                />
              </div>
              {offer && (
                <div>
                  <label htmlFor="discountedPrice" className={labelBase}>
                    Discounted price (Rs) {type === "rent" && "/ month"}
                  </label>
                  <input
                    type="number"
                    id="discountedPrice"
                    value={discountedPrice || ""}
                    onChange={onChange}
                    min={50}
                    max={400000000}
                    required={offer}
                    className={inputBase}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className={sectionTitle}>Photos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Up to 6 images. Remove or add images below.
            </p>
            {existingImgUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Current images ({existingImgUrls.length})
                </p>
                <div className="flex gap-3 flex-wrap">
                  {existingImgUrls.map((url, i) => (
                    <div key={`ex-${i}`} className="relative group">
                      <img
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {newImagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  New images ({newImagePreviews.length})
                </p>
                <div className="flex gap-3 flex-wrap">
                  {newImagePreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative group">
                      <img
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded-xl border-2 border-primary-300 dark:border-primary-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {existingImgUrls.length + newImagePreviews.length < 6 && (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <HiCamera className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {newImagePreviews.length ? `Add more (${6 - existingImgUrls.length - newImagePreviews.length} left)` : "Add more images (optional)"}
                </span>
                <input
                  type="file"
                  id="images"
                  onChange={onChange}
                  accept=".jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                />
              </label>
            )}
            {existingImgUrls.length + newImagePreviews.length === 0 && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">At least one image is required.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-primary-500 text-white font-semibold text-base shadow-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
