import { Link } from "react-router-dom";
import { HiHome, HiTag, HiOutlinePlusCircle, HiMail, HiPhone } from "react-icons/hi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import logo from "../img/1.png";
import logo2 from "../assests/svg/2.png";
import { useContext } from "react";
import { DarkModeContext } from "../App";

const footerLinks = [
  { to: "/", label: "Home", icon: HiHome },
  { to: "/offers", label: "Offers", icon: HiTag },
  { to: "/category/rent", label: "Rent", icon: HiHome },
  { to: "/category/sale", label: "Sale", icon: HiHome },
  { to: "/create-listing", label: "List Property", icon: HiOutlinePlusCircle },
];

const socialLinks = [
  { href: "https://facebook.com", icon: FaFacebookF, label: "Facebook" },
  { href: "https://twitter.com", icon: FaTwitter, label: "Twitter" },
  { href: "https://linkedin.com", icon: FaLinkedinIn, label: "LinkedIn" },
  { href: "https://instagram.com", icon: FaInstagram, label: "Instagram" },
];

export default function Footer() {
  const darkMode = useContext(DarkModeContext);

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={darkMode ? logo2 : logo}
                alt="Logo"
                className="h-9 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your trusted real estate marketplace. Find the perfect place to rent or buy, or list your property with ease.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-primary-500 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick links
            </h3>
            <ul className="space-y-3">
              {footerLinks.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    <Icon className="w-4 h-4 opacity-70" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                  Special offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get in touch
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <HiMail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:support@housemarket.com" className="hover:text-primary-400 transition-colors">
                  support@housemarket.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <HiPhone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+923001234567" className="hover:text-primary-400 transition-colors">
                  +92 300 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} House Market. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built for finding and listing properties.
          </p>
        </div>
      </div>
    </footer>
  );
}
