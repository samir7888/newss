"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function toggleVisibility() {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition duration-200 hover:bg-red-700 hover:scale-105 active:scale-95 no-print"
      aria-label="Scroll back to top"
      title="माथि जानुहोस् / Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
