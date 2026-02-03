import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { EffectFade, Autoplay, Navigation, Pagination } from "swiper";
import "swiper/css/bundle";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { DarkModeContext } from "../App";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { HiOutlineShare, HiOutlineLocationMarker, HiOutlineChevronLeft } from "react-icons/hi";
import { FaBed, FaBath, FaParking, FaChair } from "react-icons/fa";

SwiperCore.use([Autoplay, Navigation, Pagination]);

export default function Listing() {
  const darkMode = useContext(DarkModeContext);
  const auth = getAuth();
  const user = auth.currentUser;
  const params = useParams();
  const navigate = useNavigate();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [contactLandlord, setContactLandlord] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
      }
      setLoading(false);
    }
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (listing) {
      addRecentlyViewed({
        id: params.listingId,
        type: listing.type,
        name: listing.name,
      });
    }
  }, [listing, params.listingId, addRecentlyViewed]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  if (loading) return <Spinner />;
  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">Listing not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const price = listing.offer ? listing.discountedPrice : listing.regularPrice;
  const priceFormatted = Number(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const categoryLabel = listing.type === "rent" ? "Rent" : "Sale";
  const backHref = listing.type === "rent" ? "/category/rent" : "/category/sale";
  const hasMap = listing.geolocation?.lat != null && listing.geolocation?.lng != null;

  const specs = [
    { icon: FaBed, label: +listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed" },
    { icon: FaBath, label: +listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath" },
    { icon: FaParking, label: listing.parking ? "Parking" : "No parking" },
    { icon: FaChair, label: listing.furnished ? "Furnished" : "Not furnished" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Minimal top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => navigate(backHref)}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
        >
          <HiOutlineChevronLeft className="w-5 h-5" />
          {categoryLabel}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Share"
        >
          <HiOutlineShare className="w-5 h-5" />
        </button>
      </div>
      {shareLinkCopied && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-800 text-white text-sm font-medium shadow-xl">
          Link copied
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Gallery + details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gallery */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 relative">
              <Swiper
                slidesPerView={1}
                navigation
                pagination={{ type: "bullets", clickable: true }}
                effect="fade"
                modules={[EffectFade]}
                autoplay={{ delay: 5000 }}
                className="!h-[220px] sm:!h-[300px] md:!h-[380px] [&_.swiper-button-next]:!text-white [&_.swiper-button-prev]:!text-white [&_.swiper-pagination-bullet]:!bg-white/80"
              >
                {listing.imgUrls?.map((url, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Title + price + address */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    listing.type === "rent"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {categoryLabel}
                </span>
                {listing.offer && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    Offer
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {listing.name}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-primary-500 dark:text-primary-400">
                Rs {priceFormatted}
                {listing.type === "rent" && (
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400"> / month</span>
                )}
              </p>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{listing.address}</span>
              </div>
            </div>

            {/* Specs row */}
            <div className="flex flex-wrap gap-3">
              {specs.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <Icon className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Description
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </section>
            )}

            {/* Short map */}
            {hasMap && (
              <section className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <HiOutlineLocationMarker className="w-4 h-4 text-primary-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Location</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm truncate">· {listing.address}</span>
                </div>
                <div className="h-[200px] sm:h-[240px] z-0">
                  <MapContainer
                    center={[listing.geolocation.lat, listing.geolocation.lng]}
                    zoom={14}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
                      <Popup>{listing.address}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </section>
            )}
          </div>

          {/* Right: Sticky contact card */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {listing.userRef !== user?.uid && !contactLandlord && (
                <div className="rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Interested?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Contact the landlord via WhatsApp, call, or Gmail.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactLandlord(true)}
                    className="w-full py-4 rounded-2xl bg-primary-500 text-white font-bold text-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors shadow-lg shadow-primary-500/30"
                  >
                    Contact landlord
                  </button>
                </div>
              )}
              {contactLandlord && (
                <Contact userRef={listing.userRef} listing={listing} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
