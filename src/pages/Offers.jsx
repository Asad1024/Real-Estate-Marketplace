import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import ListingItem from "../components/ListingItem";
import FilterBar, { defaultFilters } from "../components/FilterBar";
import { applyListingFilters } from "../utils/listingFilters";
import { Link } from "react-router-dom";
import { HiTag, HiOutlineLightningBolt } from "react-icons/hi";

const PAGE_SIZE = 12;
const INITIAL_FETCH = 50;

export default function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(INITIAL_FETCH)
        );
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisible);
        const list = [];
        querySnap.forEach((doc) =>
          list.push({ id: doc.id, data: doc.data() })
        );
        setListings(list);
      } catch (error) {
        toast.error("Could not fetch listings");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const filteredListings = useMemo(
    () => applyListingFilters(listings || [], filters),
    [listings, filters]
  );

  async function onFetchMoreListings() {
    if (!lastFetchedListing) return;
    try {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(PAGE_SIZE)
      );
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchListing(lastVisible || null);
      const list = [];
      querySnap.forEach((doc) =>
        list.push({ id: doc.id, data: doc.data() })
      );
      setListings((prev) => [...(prev || []), ...list]);
    } catch (error) {
      toast.error("Could not fetch more listings");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-500/10 via-slate-50 to-amber-500/10 dark:from-primary-900/30 dark:via-slate-900 dark:to-amber-900/20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white shadow-lg">
                <HiTag className="w-7 h-7" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Special offers
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  Discounted listings — save on rent and sale
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              showTypeFilter={true}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Loading offers...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                <span className="text-slate-800 dark:text-slate-100 font-semibold">
                  {filteredListings.length}
                </span>{" "}
                offer{filteredListings.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
            {listings && listings.length >= INITIAL_FETCH && lastFetchedListing && (
              <div className="flex justify-center mt-12">
                <button
                  type="button"
                  onClick={onFetchMoreListings}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Load more offers
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 px-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6">
              <HiOutlineLightningBolt className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              No offers match your filters
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-8">
              Try adjusting your search or filters, or browse all listings.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Browse all listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
