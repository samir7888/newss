"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    function updateScrollProgress() {
      const currentProgress = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100,
        );
      }
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-red-600 transition-all duration-75 ease-out shadow-xs"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
