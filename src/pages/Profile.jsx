import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import ListingItem from "../components/ListingItem";
import {
  HiOutlinePencil,
  HiOutlineLogout,
  HiOutlinePlusCircle,
  HiOutlineHome,
  HiOutlineUser,
} from "react-icons/hi";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName ?? "",
    email: auth.currentUser?.email ?? "",
    image: auth.currentUser?.photoURL ?? "",
  });

  const { name, email, image } = formData;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: auth.currentUser?.displayName ?? "",
      email: auth.currentUser?.email ?? "",
      image: auth.currentUser?.photoURL ?? "",
    }));
  }, [auth.currentUser]);

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    setSaving(true);
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, { name });
      }
      toast.success("Profile updated");
      setChangeDetail(false);
    } catch (error) {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => {
    if (changeDetail) onSubmit();
    setChangeDetail((prev) => !prev);
  };

  useEffect(() => {
    async function fetchUserListings() {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      const list = [];
      querySnap.forEach((docSnap) =>
        list.push({ id: docSnap.id, data: docSnap.data() })
      );
      setListings(list);
      setLoading(false);
    }
    fetchUserListings();
  }, [auth.currentUser?.uid]);

  const onDelete = async (listingID) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, "listings", listingID));
      setListings((prev) => prev.filter((listing) => listing.id !== listingID));
      toast.success("Listing deleted");
    } catch (error) {
      toast.error("Could not delete listing");
    }
  };

  const onEdit = (listingID) => {
    navigate(`/edit-listing/${listingID}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative shrink-0">
                <img
                  src={image || "https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff"}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-700"
                />
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  My profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Manage your account and listings
                </p>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Display name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        disabled={!changeDetail}
                        onChange={onChange}
                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                          changeDetail
                            ? "border-primary-300 dark:border-primary-600"
                            : "border-slate-200 dark:border-slate-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={toggleEdit}
                        disabled={saving}
                        className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-70"
                        aria-label={changeDetail ? "Save name" : "Edit name"}
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                  >
                    <HiOutlineLogout className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List property CTA */}
        <Link
          to="/create-listing"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-primary-500 text-white font-semibold text-base shadow-lg hover:bg-primary-600 transition-all mb-8"
        >
          <HiOutlinePlusCircle className="w-6 h-6" />
          List a property
        </Link>

        {/* My listings */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400">
              <HiOutlineHome className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                My listings
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading ? "Loading..." : listings?.length ? `${listings.length} listing${listings.length !== 1 ? "s" : ""}` : "No listings yet"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Loading your listings...</p>
            </div>
          ) : listings && listings.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-16 px-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <HiOutlineHome className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                No listings yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                List your first property to reach buyers and renters.
              </p>
              <Link
                to="/create-listing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
              >
                <HiOutlinePlusCircle className="w-5 h-5" />
                List a property
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
