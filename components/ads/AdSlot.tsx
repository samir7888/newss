"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/site";

// ─── Variant definitions ────────────────────────────────────────────────────

type AdVariant = "leaderboard" | "in-feed" | "in-article" | "sidebar";

/**
 * Monetag zone-type mapping:
 *   Native Banner  → leaderboard, in-feed   (in-content / in-article native units)
 *   Standard Banner → sidebar, in-article   (fixed-size display units)
 *
 * AdSense is kept as a fallback: if Monetag vars are empty but AdSense vars
 * are set, the component renders the AdSense <ins> element instead.
 * When both are empty, a clearly-labelled placeholder is shown (dev / pre-live).
 */
type MonetagZoneType = "native" | "banner";

const MONETAG_ZONE_TYPE: Record<AdVariant, MonetagZoneType> = {
  leaderboard: "native",
  "in-feed": "native",
  "in-article": "banner",
  sidebar: "banner",
};

// ─── Environment variables ───────────────────────────────────────────────────

// Monetag — fill these after creating zones in https://monetag.com dashboard.
// Only "Native Banner" and "Banner" zone types are supported here.
// Do NOT use Popunder / Interstitial / Vignette / SmartLink zones.
const MONETAG_NATIVE_ZONE_ID = 11772604
const MONETAG_BANNER_ZONE_ID =
  process.env.NEXT_PUBLIC_MONETAG_BANNER_ZONE_ID ?? "";
const MONETAG_SCRIPT_HOST =
  process.env.NEXT_PUBLIC_MONETAG_SCRIPT_HOST ?? "ad.push2traffic.com";

// AdSense fallback — used when Monetag vars are absent but AdSense is approved.
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
const ADSENSE_SLOTS: Record<AdVariant, string> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD ?? "",
  "in-feed": process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED ?? "",
  "in-article": process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE ?? "",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
};

// ─── Layout / sizing ─────────────────────────────────────────────────────────

interface AdSlotProps {
  variant?: AdVariant;
  label?: string;
  locale?: Locale;
  className?: string;
}

/**
 * Reserved fixed heights prevent Cumulative Layout Shift (CLS).
 * Sizes match the zone dimensions created in Monetag's dashboard.
 * Adjust `inner` height if your actual zone uses a different size.
 */
const variantStyles: Record<AdVariant, { container: string; inner: string }> =
  {
    leaderboard: {
      // ~728×90 leaderboard / responsive native strip
      container: "my-8 w-full",
      inner: "h-[90px] sm:h-[110px] md:h-[120px] max-w-[970px] mx-auto",
    },
    "in-feed": {
      // Native in-feed unit — matches typical 320×100 / fluid native
      container: "my-6 w-full",
      inner: "h-[120px] sm:h-[140px]",
    },
    "in-article": {
      // 300×250 medium rectangle, centred in article column
      container: "my-10 w-full",
      inner: "h-[250px] sm:h-[280px] max-w-[680px] mx-auto",
    },
    sidebar: {
      // 300×250 medium rectangle — hidden on mobile via parent wrapper
      container: "my-6 w-full",
      inner: "h-[250px] max-w-[300px] mx-auto",
    },
  };

// ─── Component ────────────────────────────────────────────────────────────────

export function AdSlot({
  variant = "leaderboard",
  label,
  locale = "ne",
  className = "",
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const style = variantStyles[variant];
  const defaultLabel = locale === "ne" ? "विज्ञापन" : "Advertisement";
  const displayLabel = label ?? defaultLabel;

  // Determine which provider to use
  const zoneType = MONETAG_ZONE_TYPE[variant];
  const monetagZoneId =
    zoneType === "native" ? MONETAG_NATIVE_ZONE_ID : MONETAG_BANNER_ZONE_ID;

  const isMonetagLive = !!monetagZoneId;
  const isAdsenseLive =
    !isMonetagLive && !!(ADSENSE_CLIENT && ADSENSE_SLOTS[variant]);

  // ── Monetag script injection (per-component, async, no <head> pollution) ──
  useEffect(() => {
    if (!isMonetagLive || !containerRef.current) return;

    const container = containerRef.current;

    // Guard: don't double-inject if already present (React Strict Mode / HMR)
    if (container.querySelector("script[data-monetag-zone]")) return;

    // Monetag script: uses data-zone attribute and tag.min.js
    const script = document.createElement("script");
    script.dataset.zone = String(monetagZoneId);
    script.src = `https://n6wxm.com/vignette.min.js`;
    container.appendChild(script);

    return () => {
      // Cleanup on unmount / re-render to avoid duplicate scripts
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonetagLive, monetagZoneId]);

  // ── AdSense push (only when Monetag is absent and AdSense vars are set) ──
  useEffect(() => {
    if (!isAdsenseLive) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (e) {
      // AdSense not loaded yet — safe to ignore in dev
      void e;
    }
  }, [isAdsenseLive]);

  return (
    <div
      className={`ad-container select-none ${style.container} ${className}`}
      aria-label={displayLabel}
    >
      {/* Ad label — required by ad network policies */}
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
          {displayLabel}
        </span>
        <span className="text-[10px] text-slate-400">Sponsored</span>
      </div>

      {/* ── Monetag live unit ── */}
      {isMonetagLive && (
        <div
          ref={containerRef}
          className={`ad-slot ${style.inner} overflow-hidden`}
        />
      )}

      {/* ── AdSense fallback (when Monetag vars absent but AdSense approved) ── */}
      {isAdsenseLive && (
        <div className={`ad-slot ${style.inner} overflow-hidden`}>
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOTS[variant]}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}

      {/* ── Placeholder — dev / pre-live (both providers unconfigured) ── */}
      {!isMonetagLive && !isAdsenseLive && (
        <div
          ref={containerRef}
          className={`ad-slot relative flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300/80 bg-slate-50/60 p-4 text-center text-slate-400 transition hover:bg-slate-50 ${style.inner}`}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
            <span>{displayLabel}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {locale === "ne" ? "यहाँ विज्ञापन प्रदर्शन हुनेछ" : "Ad space reserved"}
          </p>
        </div>
      )}
    </div>
  );
}
