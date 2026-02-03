import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import logo from "../img/1.png";
import logo2 from "../assests/svg/2.png";
import { FcHome } from "react-icons/fc";
import { TbDiscount2 } from "react-icons/tb";
import { HiOutlinePlusCircle, HiOutlineHeart, HiMenu, HiX, HiOutlineUser, HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import "../index.css";

function getFirstLetter(user) {
  if (!user) return null;
  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim()[0].toUpperCase();
  }
  if (user.email) return user.email[0].toUpperCase();
  return "?";
}

export default function Header({ darkMode, toggleDarkMode }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pathMatchRoute = (route) => location.pathname === route;
  const isActive = (route) =>
    pathMatchRoute(route) || (route === "/profile" && pathMatchRoute("/sign-in"));

  const navItem = (route, label, Icon) => (
    <button
      type="button"
      onClick={() => {
        navigate(route);
        setMobileMenuOpen(false);
      }}
      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(route)
          ? "text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/15"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
      aria-label={label}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {label}
      {isActive(route) && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary-500 dark:bg-primary-400" />
      )}
    </button>
  );

  const avatarContent = user?.photoURL ? (
    <img
      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
      src={user.photoURL}
      alt="Profile"
    />
  ) : user ? (
    <span
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-primary-500 text-white ring-2 ring-slate-200 dark:ring-slate-600"
      aria-hidden
    >
      {getFirstLetter(user)}
    </span>
  ) : (
    <span
      className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600 ring-2 ring-slate-200 dark:ring-slate-600 text-slate-500 dark:text-slate-400"
      aria-hidden
    >
      <HiOutlineUser className="w-5 h-5" />
    </span>
  );

  const navLinkBase = "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60"
          : "bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center shrink-0 gap-2 py-2 -ml-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src={darkMode ? logo2 : logo}
              alt="House Market"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItem("/", "Home", FcHome)}
            {navItem("/offers", "Offers", TbDiscount2)}
            {user ? (
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className={`${navLinkBase} ${
                  pathMatchRoute("/favorites")
                    ? "text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/15"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <HiOutlineHeart className="w-5 h-5" />
                Saved
              </Link>
            ) : (
              <span className={`${navLinkBase} invisible pointer-events-none select-none`} aria-hidden>
                <HiOutlineHeart className="w-5 h-5" />
                Saved
              </span>
            )}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-2 shrink-0" aria-hidden />
            <Link
              to="/create-listing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              List property
            </Link>
          </nav>

          {/* Desktop right: theme + profile */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/profile");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-xl overflow-hidden hover:ring-2 hover:ring-primary-400 dark:hover:ring-primary-500 transition-all"
              aria-label="Profile"
            >
              {avatarContent}
            </button>
          </div>

          {/* Mobile: icons + menu */}
          <div className="flex md:hidden items-center gap-1">
            {user ? (
              <Link
                to="/favorites"
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Saved"
              >
                <HiOutlineHeart className="w-5 h-5" />
              </Link>
            ) : (
              <span className="p-2.5 rounded-xl invisible pointer-events-none w-10 h-10 flex items-center justify-center" aria-hidden>
                <HiOutlineHeart className="w-5 h-5" />
              </span>
            )}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="shrink-0 w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-xl overflow-hidden"
              aria-label="Profile"
            >
              {avatarContent}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <nav className="px-4 py-4 flex flex-col gap-1 max-h-[70vh] overflow-auto">
            {navItem("/", "Home", FcHome)}
            {navItem("/offers", "Offers", TbDiscount2)}
            {user && (
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <HiOutlineHeart className="w-5 h-5" />
                Saved
              </Link>
            )}
            <Link
              to="/create-listing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-primary-500 text-white font-semibold text-sm mt-2"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              List property
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
