import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ListingItem from "../components/ListingItem";
import FilterBar, { defaultFilters } from "../components/FilterBar";
import { applyListingFilters } from "../utils/listingFilters";
import { fetchAddressSuggestions } from "../utils/addressSuggestions";
import { db } from "../firebase";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import {
  HiChevronRight,
  HiHome,
  HiShieldCheck,
  HiOutlineSparkles,
  HiTrendingUp,
} from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";
import { FiSearch } from "react-icons/fi";

const HERO_BG_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=80",
];

const LISTINGS_PER_SECTION = 25;
const DISPLAY_PER_STRIP = 8;

export default function Home() {
  const { recentlyViewed } = useRecentlyViewed();
  const [user, setUser] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [offerListings, setOfferListings] = useState(null);
  const [rentListings, setRentListings] = useState(null);
  const [saleListings, setSaleListings] = useState(null);
  const [featuredListings, setFeaturedListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [heroOverlayVisible, setHeroOverlayVisible] = useState(false);
  const [heroSearchInput, setHeroSearchInput] = useState("");
  const [heroSuggestions, setHeroSuggestions] = useState([]);
  const [heroShowSuggestions, setHeroShowSuggestions] = useState(false);
  const [heroLoadingSuggestions, setHeroLoadingSuggestions] = useState(false);
  const rentSectionRef = useRef(null);
  const saleSectionRef = useRef(null);
  const heroTimeoutRef = useRef(null);
  const heroSuggestionsDebounceRef = useRef(null);
  const heroSearchWrapperRef = useRef(null);
  const filterSectionRef = useRef(null);

  useEffect(() => {
    setHeroSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const q = heroSearchInput?.trim() || "";
    if (q.length < 2) {
      setHeroSuggestions([]);
      setHeroShowSuggestions(false);
      setHeroLoadingSuggestions(false);
      return;
    }
    if (heroSuggestionsDebounceRef.current) clearTimeout(heroSuggestionsDebounceRef.current);
    heroSuggestionsDebounceRef.current = setTimeout(async () => {
      setHeroShowSuggestions(true);
      setHeroLoadingSuggestions(true);
      try {
        const list = await fetchAddressSuggestions(q);
        setHeroSuggestions(list);
      } catch {
        setHeroSuggestions([]);
      } finally {
        setHeroLoadingSuggestions(false);
      }
    }, 400);
    return () => {
      if (heroSuggestionsDebounceRef.current) clearTimeout(heroSuggestionsDebounceRef.current);
    };
  }, [heroSearchInput]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (heroSearchWrapperRef.current && !heroSearchWrapperRef.current.contains(e.target)) {
        setHeroShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!recentlyViewed.length) {
      setRecentListings([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        recentlyViewed.map(async (item) => {
          const snap = await getDoc(doc(db, "listings", item.id));
          if (!snap.exists()) return null;
          return { id: snap.id, data: snap.data() };
        })
      );
      if (!cancelled) setRecentListings(results.filter(Boolean));
    })();
    return () => { cancelled = true; };
  }, [recentlyViewed]);

  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, "listings");
        const [offersSnap, rentSnap, saleSnap, featuredSnap] = await Promise.all([
          getDocs(
            query(
              listingsRef,
              where("offer", "==", true),
              orderBy("timestamp", "desc"),
              limit(LISTINGS_PER_SECTION)
            )
          ),
          getDocs(
            query(
              listingsRef,
              where("type", "==", "rent"),
              orderBy("timestamp", "desc"),
              limit(LISTINGS_PER_SECTION)
            )
          ),
          getDocs(
            query(
              listingsRef,
              where("type", "==", "sale"),
              orderBy("timestamp", "desc"),
              limit(LISTINGS_PER_SECTION)
            )
          ),
          getDocs(
            query(listingsRef, orderBy("timestamp", "desc"), limit(10))
          ),
        ]);
        const toList = (snap) => {
          const list = [];
          snap.forEach((docSnap) =>
            list.push({ id: docSnap.id, data: docSnap.data() })
          );
          return list;
        };
        setOfferListings(toList(offersSnap));
        setRentListings(toList(rentSnap));
        setSaleListings(toList(saleSnap));
        setFeaturedListings(toList(featuredSnap));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const filteredOffers = useMemo(
    () => applyListingFilters(offerListings || [], filters),
    [offerListings, filters]
  );
  const filteredRent = useMemo(
    () => applyListingFilters(rentListings || [], filters),
    [rentListings, filters]
  );
  const filteredSale = useMemo(
    () => applyListingFilters(saleListings || [], filters),
    [saleListings, filters]
  );
  const filteredFeatured = useMemo(
    () => applyListingFilters(featuredListings || [], filters),
    [featuredListings, filters]
  );

  const filteredRecentListings = useMemo(() => {
    let list = recentListings || [];
    if (filters.type === "rent" || filters.type === "sale") {
      list = list.filter((item) => item.data?.type === filters.type);
    }
    return applyListingFilters(list, filters);
  }, [recentListings, filters]);

  const showOffers = filters.type === "all";
  const showRent = filters.type === "all" || filters.type === "rent";
  const showSale = filters.type === "all" || filters.type === "sale";

  useEffect(() => {
    const id = setInterval(() => {
      setHeroOverlayVisible(true);
      heroTimeoutRef.current = setTimeout(() => {
        setHeroBgIndex((i) => (i + 1) % HERO_BG_IMAGES.length);
        setHeroOverlayVisible(false);
      }, 1000);
    }, 5000);
    return () => {
      clearInterval(id);
      if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    };
  }, []);

  const handleTypeClick = (type) => {
    setFilters((prev) => ({ ...prev, type }));
    if (type === "rent") {
      setTimeout(() => rentSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } else if (type === "sale") {
      setTimeout(() => saleSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const ListingStrip = ({ listings, title, href, label, sectionRef }) => (
    <section ref={sectionRef} className="mb-12 last:mb-0">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {href && (
          <Link
            to={href}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0"
          >
            {label}
            <HiChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {listings.slice(0, DISPLAY_PER_STRIP).map((listing) => (
          <div
            key={listing.id}
            className="w-[280px] sm:w-[300px] flex-shrink-0"
          >
            <ListingItem listing={listing.data} id={listing.id} />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero: background image + gradient overlay + headline + search + icons */}
      <header className="relative overflow-x-hidden overflow-y-visible min-h-[300px] sm:min-h-[340px] flex flex-col justify-end">
        {/* Background images (rotate every 5s) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-none"
          style={{ backgroundImage: `url(${HERO_BG_IMAGES[heroBgIndex]})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${HERO_BG_IMAGES[(heroBgIndex + 1) % HERO_BG_IMAGES.length]})`,
            opacity: heroOverlayVisible ? 1 : 0,
          }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-primary-900/50 dark:from-slate-950/95 dark:via-slate-900/75 dark:to-primary-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(14,165,233,0.2),transparent)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full pt-10 sm:pt-14 pb-14 sm:pb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white">
              <HiHome className="w-6 h-6" />
            </span>
            <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
              Real estate marketplace
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-3xl drop-shadow-lg">
            Find your next place
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-xl drop-shadow">
            Search by location, filter by type and price. Rent or buy — all in one place.
          </p>

          <div className="mt-10 max-w-2xl">
            <div className="flex gap-2">
              <div
                ref={heroSearchWrapperRef}
                className="relative flex-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-visible"
              >
                <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="City or address..."
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  onFocus={() => heroSearchInput?.trim().length >= 2 && setHeroShowSuggestions(true)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 text-base font-medium focus:outline-none focus:ring-0"
                />
                {heroShowSuggestions && (heroSuggestions.length > 0 || heroLoadingSuggestions) && (
                  <div className="absolute left-0 right-0 top-full mt-1 py-1 rounded-xl border border-white/20 bg-slate-800/95 backdrop-blur-md shadow-xl z-50 max-h-60 overflow-auto">
                    {heroLoadingSuggestions ? (
                      <div className="px-4 py-3 text-sm text-white/70">Loading...</div>
                    ) : (
                      heroSuggestions.map((item) => (
                        <button
                          key={item.place_id}
                          type="button"
                          onClick={() => {
                            setHeroSearchInput(item.shortLabel ?? item.display_name);
                            setHeroShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 flex items-start gap-2 transition-colors"
                        >
                          <MdLocationOn className="w-4 h-4 text-primary-300 shrink-0 mt-0.5" />
                          <span className="truncate">{item.shortLabel ?? item.display_name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: heroSearchInput }));
                  filterSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="shrink-0 flex items-center gap-2 px-5 py-4 rounded-2xl bg-white text-primary-700 font-semibold text-sm hover:bg-white/95 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {["rent", "sale"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeClick(type)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filters.type === type
                      ? "bg-white text-primary-700"
                      : "bg-white/10 text-white/90 hover:bg-white/20"
                  }`}
                >
                  {type === "rent" ? "Rent" : "Buy"}
                </button>
              ))}
            </div>

            {/* Trust / feature icons row */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-6 pt-5 border-t border-white/15">
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <HiShieldCheck className="w-5 h-5 text-white shrink-0" />
                Trusted listings
              </span>
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <HiOutlineSparkles className="w-5 h-5 text-white shrink-0" />
                Real-time updates
              </span>
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <HiTrendingUp className="w-5 h-5 text-white shrink-0" />
                Best offers
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters: slim bar — scroll target when hero search is focused */}
      <div
        ref={filterSectionRef}
        className="sticky top-16 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <FilterBar filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Main content: horizontal strips */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
              Loading...
            </p>
          </div>
        ) : (
          <>
            {/* When "All": show Featured, Recently viewed, Offers, Rent, Sale */}
            {/* When "Rent": show only For rent */}
            {/* When "Buy": show only For sale */}

            {/* Featured — only when All */}
            {filters.type === "all" && filteredFeatured.length > 0 && (
              <ListingStrip
                listings={filteredFeatured}
                title="Featured"
                href="/offers"
                label="See all"
              />
            )}

            {/* Recently viewed — only when All */}
            {filters.type === "all" && user && filteredRecentListings.length > 0 && (
              <ListingStrip
                listings={filteredRecentListings}
                title="Recently viewed"
                label="Pick up where you left off"
              />
            )}

            {/* Offers — only when All */}
            {showOffers && filteredOffers.length > 0 && (
              <ListingStrip
                listings={filteredOffers}
                title="Offers"
                href="/offers"
                label="View all offers"
              />
            )}

            {/* For rent — when All or Rent (only section when Rent) */}
            {showRent && filteredRent.length > 0 && (
              <ListingStrip
                listings={filteredRent}
                title="For rent"
                href="/category/rent"
                label="View all for rent"
                sectionRef={rentSectionRef}
              />
            )}

            {/* For sale — when All or Buy (only section when Buy) */}
            {showSale && filteredSale.length > 0 && (
              <ListingStrip
                listings={filteredSale}
                title="For sale"
                href="/category/sale"
                label="View all for sale"
                sectionRef={saleSectionRef}
              />
            )}

            {/* Empty */}
            {!loading &&
              (filters.type === "all"
                ? !filteredOffers?.length &&
                  !filteredRent?.length &&
                  !filteredSale?.length &&
                  !filteredFeatured?.length
                : filters.type === "rent"
                  ? !filteredRent?.length
                  : !filteredSale?.length) && (
                <div className="text-center py-24">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    No listings match your filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilters(defaultFilters)}
                    className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
          </>
        )}
      </main>
    </div>
  );
}
