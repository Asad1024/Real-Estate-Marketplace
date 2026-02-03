import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import { useFavoritesContext } from "../context/FavoritesContext";
import { HiOutlineHeart } from "react-icons/hi";

export default function Favorites() {
  const favorites = useFavoritesContext();
  const favoriteIds = favorites?.favoriteIds ?? [];
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!favoriteIds.length) {
      setListings([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchListings() {
      const results = await Promise.all(
        favoriteIds.map(async (listingId) => {
          const docRef = doc(db, "listings", listingId);
          const snap = await getDoc(docRef);
          if (!snap.exists()) return null;
          return { id: snap.id, data: snap.data() };
        })
      );
      if (!cancelled) {
        setListings(results.filter(Boolean));
      }
      setLoading(false);
    }
    fetchListings();
    return () => { cancelled = true; };
  }, [favoriteIds.join(",")]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Saved listings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {favoriteIds.length === 0
              ? "Save listings you like to find them here."
              : `${favoriteIds.length} listing${favoriteIds.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
          </div>
        ) : listings.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(({ id, data }) => (
              <ListingItem key={id} id={id} listing={data} showFavorite />
            ))}
          </ul>
        ) : (
          <div className="text-center py-20 px-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6">
              <HiOutlineHeart className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              No saved listings yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-8">
              When you save a listing, it will appear here. Browse the marketplace and tap the heart on any listing.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Browse listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
