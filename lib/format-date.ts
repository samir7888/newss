import type { Locale } from "./site";

export function formatRelativeTime(
  dateInput: string | Date | null | undefined,
  locale: Locale = "ne",
): string {
  if (!dateInput) {
    return locale === "ne" ? "भर्खरै" : "Just now";
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return locale === "ne" ? "भर्खरै" : "Just now";
  }

  if (diffMinutes < 60) {
    return locale === "ne"
      ? `${diffMinutes} मिनेट अगाडि`
      : `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return locale === "ne"
      ? `${diffHours} घण्टा अगाडि`
      : `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return locale === "ne"
      ? `${diffDays} दिन अगाडि`
      : `${diffDays}d ago`;
  }

  // Format as date if older than 7 days
  if (locale === "ne") {
    return date.toLocaleDateString("ne-NP", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(
  dateInput: string | Date | null | undefined,
  locale: Locale = "ne",
): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (locale === "ne") {
    return date.toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function getTodayFormatted(locale: Locale = "ne"): string {
  const now = new Date();
  if (locale === "ne") {
    return now.toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

/**
 * Calculates approximate reading time for an article.
 * Average reading speed: ~180 words per minute for Nepali/Devanagari, ~200 wpm for English.
 */
export function calculateReadTime(
  text: string | null | undefined,
  locale: Locale = "ne",
): string {
  if (!text) {
    return locale === "ne" ? "१ मिनेट पढ्न लाग्ने" : "1 min read";
  }

  // Strip html tags
  const clean = text.replace(/<[^>]+>/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / (locale === "ne" ? 160 : 200)));

  if (locale === "ne") {
    return `${minutes} मिनेट पढ्न लाग्ने`;
  }
  return `${minutes} min read`;
}
