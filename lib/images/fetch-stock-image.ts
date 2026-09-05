import { config } from "dotenv";
config({ path: ".env.local" });

export interface StockImageResult {
  imageUrl: string;
  imageAlt: string;
  imageCredit: string;
  imageCreditUrl: string;
}

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves",
  // Common news wire words
  "said", "says", "amid", "due", "update", "updates", "breaking", "exclusive",
  "reports", "report", "reported", "latest", "today", "yesterday", "tomorrow",
  "first", "new", "news", "nepal", "nepali"
]);

export function extractSearchKeywords(title: string, category?: string): string {
  const cleanCategory = (category || "").trim().toLowerCase();
  
  if (!title) {
    return cleanCategory ? `Nepal ${cleanCategory}` : "Nepal";
  }

  // Remove URLs, punctuation, and digits
  const cleaned = title
    .replace(/https?:\/\/\S+/g, "")
    .replace(/['"’“”]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));

  // Pick up to 3 strong keywords
  const selected = words.slice(0, 3);

  if (selected.length === 0) {
    return cleanCategory ? `Nepal ${cleanCategory}` : "Nepal news";
  }

  return `Nepal ${selected.join(" ")}`.trim();
}

export function buildUnsplashImageUrl(topic: string): string {
  const imageByCategory: Record<string, string> = {
    politics:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    economy:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    technology:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    culture:
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80",
    sports:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    general:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
  };
  const category = (topic || "").split(" ")[0]?.toLowerCase();
  return imageByCategory[category] || imageByCategory.culture || imageByCategory.general;
}

export async function fetchStockImage(
  query: string,
  fallbackCategory = "general",
): Promise<StockImageResult> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  const pexelsKey = process.env.PEXELS_API_KEY?.trim();

  // Try Unsplash first
  if (unsplashKey) {
    try {
      const url = new URL("https://api.unsplash.com/search/photos");
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", "5");
      url.searchParams.set("orientation", "landscape");

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Client-ID ${unsplashKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        let results = data.results ?? [];

        // If specific search had 0 results, retry with category fallback
        if (results.length === 0 && fallbackCategory && fallbackCategory !== query) {
          const retryUrl = new URL("https://api.unsplash.com/search/photos");
          retryUrl.searchParams.set("query", `Nepal ${fallbackCategory}`);
          retryUrl.searchParams.set("per_page", "5");
          retryUrl.searchParams.set("orientation", "landscape");

          const retryRes = await fetch(retryUrl.toString(), {
            headers: { Authorization: `Client-ID ${unsplashKey}` },
            signal: AbortSignal.timeout(4000),
          });

          if (retryRes.ok) {
            const retryData = await retryRes.json();
            results = retryData.results ?? [];
          }
        }

        if (results.length > 0) {
          const pickIndex = Math.floor(Math.random() * Math.min(results.length, 5));
          const pick = results[pickIndex];
          const rawUrl = pick.urls?.raw || pick.urls?.regular || "";
          const finalUrl = rawUrl.includes("?")
            ? `${rawUrl}&w=1200&q=80&fit=crop&auto=format`
            : `${rawUrl}?w=1200&q=80&fit=crop&auto=format`;

          const photographer = pick.user?.name || "Unsplash";
          const creditUrl =
            pick.user?.links?.html
              ? `${pick.user.links.html}?utm_source=nepali_samachar&utm_medium=referral`
              : "https://unsplash.com";

          return {
            imageUrl: finalUrl,
            imageAlt: pick.alt_description || pick.description || query,
            imageCredit: `${photographer} (Unsplash)`,
            imageCreditUrl: creditUrl,
          };
        }
      }
    } catch (err) {
      console.warn("Unsplash API fetch failed, trying Pexels:", (err as Error).message);
    }
  }

  // Fallback: Pexels
  if (pexelsKey) {
    try {
      const url = new URL("https://api.pexels.com/v1/search");
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", "5");
      url.searchParams.set("orientation", "landscape");

      const response = await fetch(url.toString(), {
        headers: { Authorization: pexelsKey },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        let photos = data.photos ?? [];

        if (photos.length === 0 && fallbackCategory && fallbackCategory !== query) {
          const retryUrl = new URL("https://api.pexels.com/v1/search");
          retryUrl.searchParams.set("query", fallbackCategory);
          retryUrl.searchParams.set("per_page", "5");
          retryUrl.searchParams.set("orientation", "landscape");

          const retryRes = await fetch(retryUrl.toString(), {
            headers: { Authorization: pexelsKey },
            signal: AbortSignal.timeout(4000),
          });

          if (retryRes.ok) {
            const retryData = await retryRes.json();
            photos = retryData.photos ?? [];
          }
        }

        if (photos.length > 0) {
          const pickIndex = Math.floor(Math.random() * Math.min(photos.length, 5));
          const pick = photos[pickIndex];
          const photographer = pick.photographer || "Pexels";
          const creditUrl = pick.photographer_url || "https://pexels.com";

          return {
            imageUrl: pick.src?.large2x || pick.src?.large || pick.src?.original || "",
            imageAlt: pick.alt || query,
            imageCredit: `${photographer} (Pexels)`,
            imageCreditUrl: creditUrl,
          };
        }
      }
    } catch (err) {
      console.warn("Pexels API fetch failed:", (err as Error).message);
    }
  }

  // Last resort: static category fallback
  return {
    imageUrl: buildUnsplashImageUrl(fallbackCategory || query),
    imageAlt: query,
    imageCredit: "Unsplash",
    imageCreditUrl: "https://unsplash.com",
  };
}
