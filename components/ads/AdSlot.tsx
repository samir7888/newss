import type { Locale } from "@/lib/site";

type AdVariant = "leaderboard" | "in-feed" | "in-article" | "sidebar";

interface AdSlotProps {
  variant?: AdVariant;
  label?: string;
  locale?: Locale;
  className?: string;
}

export function AdSlot({
  variant = "leaderboard",
  label,
  locale = "ne",
  className = "",
}: AdSlotProps) {
  const defaultLabel = locale === "ne" ? "विज्ञापन" : "Advertisement";
  const displayLabel = label || defaultLabel;

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

  const style = variantStyles[variant];

  return (
    <div
      className={`ad-container select-none ${style.container} ${className}`}
      aria-label={displayLabel}
    >
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
          {displayLabel}
        </span>
        <span className="text-[10px] text-slate-400">Sponsored</span>
      </div>
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
    </div>
  );
}
