"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/site";

type AdVariant = "leaderboard" | "in-feed" | "in-article" | "sidebar";

interface AdSlotProps {
  variant?: AdVariant;
  label?: string;
  locale?: Locale;
  className?: string;
}

// Map variant → env var slot ID
const slotEnvMap: Record<AdVariant, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  "in-feed": process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  "in-article": process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

// Reserved fixed heights to prevent Cumulative Layout Shift (CLS)
const variantStyles: Record<AdVariant, { container: string; inner: string }> = {
  leaderboard: {
    container: "my-8 w-full",
    inner: "h-[90px] sm:h-[110px] md:h-[120px] max-w-[970px] mx-auto",
  },
  "in-feed": {
    container: "my-6 w-full",
    inner: "h-[120px] sm:h-[140px]",
  },
  "in-article": {
    container: "my-10 w-full",
    inner: "h-[250px] sm:h-[280px] max-w-[680px] mx-auto",
  },
  sidebar: {
    container: "my-6 w-full",
    inner: "h-[250px] max-w-[300px] mx-auto",
  },
};

export function AdSlot({
  variant = "leaderboard",
  label,
  locale = "ne",
  className = "",
}: AdSlotProps) {
  const defaultLabel = locale === "ne" ? "विज्ञापन" : "Advertisement";
  const displayLabel = label || defaultLabel;
  const style = variantStyles[variant];
  const slotId = slotEnvMap[variant];
  const isLive = !!(publisherId && slotId);

  // Push ads after component mounts (client-side only)
  useEffect(() => {
    if (!isLive) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet — safe to ignore in dev
      void e;
    }
  }, [isLive]);

  return (
    <div
      className={`ad-container select-none ${style.container} ${className}`}
      aria-label={displayLabel}
    >
      {/* Ad label — required by Google policies */}
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
          {displayLabel}
        </span>
        <span className="text-[10px] text-slate-400">Sponsored</span>
      </div>

      {/* Live AdSense unit */}
      {isLive ? (
        <div className={`ad-slot ${style.inner} overflow-hidden`}>
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-client={publisherId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* Placeholder shown in dev when AdSense env vars are not set */
        <div
          className={`ad-slot relative flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300/80 bg-slate-50/60 p-4 text-center text-slate-400 transition hover:bg-slate-50 ${style.inner}`}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
            <span>{displayLabel}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {locale === "ne"
              ? "यहाँ विज्ञापन प्रदर्शन हुनेछ"
              : "Ad space reserved"}
          </p>
        </div>
      )}
    </div>
  );
}
