import { useState, useEffect } from "react";
import { HiArrowUp } from "react-icons/hi";

const SCROLL_THRESHOLD = 400;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      aria-label="Back to top"
    >
      <HiArrowUp className="w-5 h-5" />
    </button>
  );
}
