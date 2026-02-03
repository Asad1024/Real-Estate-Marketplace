import Moment from "react-moment";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FaBed, FaBath } from "react-icons/fa";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { DarkModeContext } from "../App";
import { useContext } from "react";
import { getAuth } from "firebase/auth";
import { useFavoritesContext } from "../context/FavoritesContext";

export default function ListingItem({ listing, id, onEdit, onDelete, showFavorite }) {
  const darkMode = useContext(DarkModeContext);
  const auth = getAuth();
  const user = auth.currentUser;
  const favorites = useFavoritesContext();
  const isFavorite = favorites?.isFavorite(id);
  const toggleFavorite = favorites?.toggle;

  const price = listing.offer ? listing.discountedPrice : listing.regularPrice;
  const priceFormatted = Number(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite?.(id);
  };

  return (
    <li className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800">
      <Link className="block" to={`/category/${listing.type}/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            src={listing.imgUrls?.[0]}
            alt={listing.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {favorites && (
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform text-slate-600 dark:text-slate-400 hover:text-rose-500"
              aria-label={isFavorite ? "Remove from saved" : "Save listing"}
            >
              {isFavorite ? (
                <HiHeart className="w-5 h-5 text-rose-500 fill-current" />
              ) : (
                <HiOutlineHeart className="w-5 h-5" />
              )}
            </button>
          )}
          <Moment
            className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold rounded-lg px-2 py-1 shadow-lg"
            fromNow
          >
            {listing.timestamp?.toDate()}
          </Moment>
          {listing.offer && (
            <span className="absolute bottom-3 right-3 bg-accent-rose text-white text-xs font-semibold rounded-lg px-2 py-1 shadow-lg">
              Offer
            </span>
          )}
          <span
            className={`absolute bottom-3 left-3 text-xs font-semibold rounded-lg px-2 py-1 ${
              listing.type === "rent"
                ? "bg-accent-emerald text-white"
                : "bg-accent-amber text-white"
            }`}
          >
            {listing.type === "rent" ? "Rent" : "Sale"}
          </span>
        </div>

        <div
          className={`p-4 ${
            darkMode
              ? "bg-slate-800 text-slate-100"
              : "bg-white text-slate-800"
          }`}
        >
          <div className="flex items-start gap-1 mb-2">
            <MdLocationOn className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {listing.address}
            </p>
          </div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 truncate mb-2">
            {listing.name}
          </h3>
          <p className="text-primary-600 dark:text-primary-400 font-bold text-xl mb-3">
            Rs {priceFormatted}
            {listing.type === "rent" && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ month</span>
            )}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <FaBed className="h-4 w-4" />
              {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
            </span>
            <span className="flex items-center gap-1">
              <FaBath className="h-4 w-4" />
              {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath"}
            </span>
          </div>
        </div>
      </Link>

      {(onDelete || onEdit) && user && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onEdit(id);
              }}
              className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-md hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="Edit"
            >
              <MdEdit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDelete(id);
              }}
              className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              aria-label="Delete"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </li>
  );
}
