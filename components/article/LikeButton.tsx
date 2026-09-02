"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import type { Locale } from "@/lib/site";

interface LikeButtonProps {
  slug: string;
  locale: Locale;
  initialLikes: number;
}

const LIKED_KEY = "nepal_news_liked_articles";

export function LikeButton({ slug, locale, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(LIKED_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        return Array.isArray(list) && list.includes(slug);
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [count, setCount] = useState(initialLikes);
  const [animating, setAnimating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLike() {
    // Once liked, it cannot be undone
    if (liked || busy) return;
    setBusy(true);

    // Like the article (one-way)
    setLiked(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    // Persist local state
    try {
      const stored = localStorage.getItem(LIKED_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(slug)) list.push(slug);
      localStorage.setItem(LIKED_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      // Count remains liked locally even if the request failed; do not roll back.
    }

    setBusy(false);
  }

  const label = locale === "ne" ? "मन पर्यो" : "Like";
  const likedLabel = locale === "ne" ? "मन पर्यो" : "Liked";

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked || busy}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition disabled:cursor-default active:scale-95 ${
        liked
          ? "border-red-600 bg-red-50 text-red-700 opacity-90"
          : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
      }`}
      aria-label={liked ? likedLabel : label}
      title={
        liked
          ? locale === "ne"
            ? "तपाईंले यो समाचार मन पराइसक्नुभयो"
            : "You have already liked this article"
          : label
      }
    >
      <ThumbsUp
        className={`h-4 w-4 ${animating ? "animate-bounce" : ""} ${
          liked ? "fill-red-600" : ""
        }`}
      />
      <span>{liked ? likedLabel : label}</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
        {count}
      </span>
    </button>
  );
}
