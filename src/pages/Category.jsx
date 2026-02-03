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
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import FilterBar, { defaultFilters } from "../components/FilterBar";
import { applyListingFilters } from "../utils/listingFilters";
import { useParams, Link } from "react-router-dom";

const PAGE_SIZE = 12;
const INITIAL_FETCH = 50;

export default function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const params = useParams();
  const categoryName = params.categoryName;

  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("type", "==", categoryName),
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
  }, [categoryName]);

  const filteredListings = useMemo(
    () => applyListingFilters(listings || [], { ...filters, type: categoryName }),
    [listings, filters, categoryName]
  );

  async function onFetchMoreListings() {
    if (!lastFetchedListing) return;
    try {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("type", "==", categoryName),
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

  const title =
    categoryName === "rent" ? "Places for rent" : "Places for sale";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
        <Link
          to="/"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          ← Back to home
        </Link>
      </div>

      <div className="mb-8">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          showTypeFilter={false}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filteredListings.length > 0 ? (
        <>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} found
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredListings.map((listing) => (
              <ListingItem
                key={listing.id}
                id={listing.id}
                listing={listing.data}
              />
            ))}
          </ul>
          {listings && listings.length >= INITIAL_FETCH && lastFetchedListing && (
            <div className="flex justify-center mt-10">
              <button
                onClick={onFetchMoreListings}
                className="px-6 py-3 rounded-xl border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No {categoryName === "rent" ? "rentals" : "properties for sale"} match your filters.
          </p>
          <Link
            to="/"
            className="inline-block mt-4 text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            Browse all listings
          </Link>
        </div>
      )}
    </div>
  );
}
