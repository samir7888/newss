"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ChevronRight, ChevronLeft } from "lucide-react";
import type { Locale } from "@/lib/site";

interface TickerItem {
  slug: string;
  title: string;
}

export function BreakingTicker({
  items,
  locale,
}: {
  items: TickerItem[];
  locale: Locale;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[currentIndex];

  return (
    <div className="flex items-center gap-2 text-xs overflow-hidden w-full max-w-2xl">
      <div className="inline-flex shrink-0 items-center gap-1 bg-red-700 text-white font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px]">
        <Flame className="h-3 w-3" />
        <span>{locale === "ne" ? "ब्रेकिङ" : "BREAKING"}</span>
      </div>

      <div className="relative flex-1 overflow-hidden h-5 flex items-center">
        <Link
          key={current.slug}
          href={`/${locale}/article/${current.slug}`}
          className="truncate font-semibold text-slate-800 hover:text-red-700 transition animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          {current.title}
        </Link>
      </div>

      {items.length > 1 && (
        <div className="hidden sm:flex items-center gap-1 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
            }
            className="p-0.5 hover:text-slate-700"
            aria-label="Previous headline"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px]">
            {currentIndex + 1}/{items.length}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % items.length)
            }
            className="p-0.5 hover:text-slate-700"
            aria-label="Next headline"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
