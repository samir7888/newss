"use client";

// COMMENTED OUT - Monetag ads disabled
/*
import { useEffect } from "react";

export default function DelayedMonetag() {
  useEffect(() => {
    const DELAY = 5000;
    let timePassed = false;
    let bottomReached = false;
    let adLoaded = false;

    const loadAd = () => {
      if (adLoaded || !timePassed || !bottomReached) return;

      adLoaded = true;

      const script = document.createElement("script");
      script.src = "https://n6wxm.com/vignette.min.js";
      script.async = true;
      script.dataset.zone = "11772604";
      script.dataset.cfasync = "false";

      document.body.appendChild(script);

      window.removeEventListener("scroll", checkScroll);
    };

    const checkScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;

      if (atBottom) {
        bottomReached = true;
        loadAd();
      }
    };

    const timer = window.setTimeout(() => {
      timePassed = true;
      loadAd();
    }, DELAY);

    window.addEventListener("scroll", checkScroll, {
      passive: true,
    });

    checkScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  return null;
}
*/

// Placeholder component while ads are disabled
export default function DelayedMonetag() {
  return null;
}
