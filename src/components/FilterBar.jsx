import { useState, useEffect, useRef } from "react";
import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import { MdLocationOn } from "react-icons/md";
import { fetchAddressSuggestions } from "../utils/addressSuggestions";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const defaultFilters = {
  type: "all",
  search: "",
  minPrice: "",
  maxPrice: "",
  minBeds: "",
  minBaths: "",
  parking: "any",
  furnished: "any",
  sort: "newest",
};

export default function FilterBar({
  filters = defaultFilters,
  onFiltersChange,
  showTypeFilter = true,
  showSearch = true,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const q = searchInput?.trim() || "";
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setShowSuggestions(true);
      setLoadingSuggestions(true);
      try {
        const list = await fetchAddressSuggestions(q);
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateFilter = (key, value) => {
    const next = { ...localFilters, [key]: value };
    setLocalFilters(next);
    onFiltersChange?.(next);
  };

  const applySearch = () => {
    const value = searchInput?.trim() ?? "";
    updateFilter("search", value);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
    setOpen(false);
  };

  const hasActiveFilters =
    localFilters.minPrice ||
    localFilters.maxPrice ||
    localFilters.minBeds ||
    localFilters.minBaths ||
    localFilters.parking !== "any" ||
    localFilters.furnished !== "any" ||
    localFilters.sort !== "newest";

  return (
    <div className="w-full space-y-3">
      {/* Search + Type + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        {showSearch && (
          <div ref={searchWrapperRef} className="relative flex-1 min-w-[200px] flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by city or address..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => searchInput?.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute left-0 right-0 top-full mt-1 py-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg z-50 max-h-60 overflow-auto">
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      Loading...
                    </div>
                  ) : (
                    suggestions.map((item) => (
                      <button
                        key={item.place_id}
                        type="button"
                        onClick={() => {
                          setSearchInput(item.shortLabel ?? item.display_name);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-start gap-2"
                      >
                        <MdLocationOn className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <span className="truncate">{item.shortLabel ?? item.display_name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={applySearch}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              <FiSearch className="w-4 h-4" />
              Search
            </button>
          </div>
        )}
        {showTypeFilter && (
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700">
            {["all", "rent", "sale"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateFilter("type", t)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  localFilters.type === t
                    ? "bg-primary-500 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                }`}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <select
            value={localFilters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              hasActiveFilters
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            }`}
          >
            <FiSliders className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-colors"
              title="Clear filters"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable filters */}
      {open && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Min Price (Rs)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={localFilters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Max Price (Rs)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={localFilters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Min Beds
              </label>
              <select
                value={localFilters.minBeds}
                onChange={(e) => updateFilter("minBeds", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Min Baths
              </label>
              <select
                value={localFilters.minBaths}
                onChange={(e) => updateFilter("minBaths", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Parking
              </label>
              <select
                value={localFilters.parking}
                onChange={(e) => updateFilter("parking", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Furnished
              </label>
              <select
                value={localFilters.furnished}
                onChange={(e) => updateFilter("furnished", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { defaultFilters, SORT_OPTIONS };
