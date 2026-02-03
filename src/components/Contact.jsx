import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { BsWhatsapp } from "react-icons/bs";
import { HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { SiGmail } from "react-icons/si";

export default function Contact({ userRef, listing }) {
  const [landlord, setLandlord] = useState(null);

  useEffect(() => {
    async function fetchLandlord() {
      try {
        const docRef = doc(db, "users", userRef);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLandlord(docSnap.data());
        } else {
          toast.error("Could not load contact details");
        }
      } catch {
        toast.error("Could not load contact details");
      }
    }
    fetchLandlord();
  }, [userRef]);

  const subject = listing?.name || "Listing enquiry";
  const hasEmail = landlord?.email && landlord.email.trim().length > 0;
  const gmailUrl = hasEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(landlord.email.trim())}&su=${encodeURIComponent(subject)}`
    : null;

  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in your listing "${listing?.name || ""}".`
  );
  const hasPhone = listing?.contact?.replace(/\D/g, "").length >= 10;

  if (!landlord) return null;

  return (
    <div className="rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/30 dark:to-slate-900 p-6 sm:p-8 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 text-white">
          <HiOutlineMail className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact landlord</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {landlord.name} · {listing?.name?.toLowerCase() ?? "this listing"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        {hasPhone && (
          <a
            href={`https://wa.me/${listing.contact.replace(/\D/g, "")}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors shadow-md"
            aria-label="WhatsApp"
          >
            <BsWhatsapp className="text-2xl shrink-0" />
          </a>
        )}
        {hasPhone && (
          <a
            href={`tel:${listing.contact}`}
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-md"
            aria-label="Call"
          >
            <HiOutlinePhone className="text-xl shrink-0" />
          </a>
        )}
        {gmailUrl && (
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors shadow-md"
            aria-label="Gmail"
          >
            <SiGmail className="text-2xl shrink-0 text-red-500" />
          </a>
        )}
      </div>

      {!hasEmail && (
        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">Contact email not set for this listing.</p>
      )}
    </div>
  );
}
