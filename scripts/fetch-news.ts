import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { load } from "cheerio";
import { eq } from "drizzle-orm";
import Parser from "rss-parser";
import { closeDatabase, db } from "../lib/db";
import { articles, categories, sources } from "../lib/db/schema";
import { contentHash, isDuplicateCandidate } from "../lib/dedup";
import { normalizeNepaliText, toRichHtml } from "../lib/article-content";
import {
  inferCategoryIdFromText,
  inferCategorySlugFromText,
} from "../lib/category-inference";

config({ path: ".env.local" });

const MAX_SCRIPT_RUNTIME_MS = 210_000; // 3.5 minutes max
const scriptStartTime = Date.now();

export function getRemainingTimeMs(): number {
  return Math.max(0, MAX_SCRIPT_RUNTIME_MS - (Date.now() - scriptStartTime));
}

export function hasTimeRemaining(bufferMs = 15_000): boolean {
  return getRemainingTimeMs() > bufferMs;
}

const parser = new Parser({
  timeout: 6000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

const defaultFeeds = [
  {
    name: "Online Khabar",
    url: process.env.FEED_URL_1 || "https://www.onlinekhabar.com/feed",
    category: "economy",
  },

  // as this has no proper html structure
  // {
  //   name: "Setopati",
  //   url: process.env.FEED_URL_2 || "https://www.setopati.com/feed",
  //   category: "politics",
  // },


  {
    name: "Ratopati",
    url: process.env.FEED_URL_3 || "https://www.ratopati.com/feed",
    category: "politics",
  },
  {
    name: "Nagarik News",
    url:
      process.env.FEED_URL_4 || "https://nagariknews.nagariknetwork.com/feed",
    category: "politics",
  },
  {
    name: "Nepali Times",
    url: process.env.FEED_URL_5 || "https://www.nepalitimes.com/feed/",
    category: "culture",
  },
  {
    name: "Techmandu",
    url: process.env.FEED_URL_6 || "https://techmandu.com/feed/",
    category: "technology",
  },
  {
    name: "The Himalayan Times",
    url: process.env.FEED_URL_7 || "https://www.thehimalayantimes.com/rss",
    category: "economy",
  },
  {
    name: "BBC Nepali",
    url: process.env.FEED_URL_8 || "https://feeds.bbci.co.uk/nepali/rss.xml",
    category: "politics",
  },
  {
    name: "Rajdhani Daily",
    url: process.env.FEED_URL_9 || "https://rajdhanidaily.com/feed/",
    category: "economy",
  },
  {
    name: "News of Nepal",
    url: process.env.FEED_URL_10 || "https://newsofnepal.com/feed/",
    category: "politics",
  },
  {
    name: "Telegraph Nepal",
    url: process.env.FEED_URL_11 || "https://www.telegraphnepal.com/feed/",
    category: "politics",
  },
  {
    name: "Arthasarokar",
    url: process.env.FEED_URL_12 || "https://arthasarokar.com/feed",
    category: "economy",
  },
  {
    name: "Kathmandu Tribune",
    url: process.env.FEED_URL_13 || "https://www.kathmandutribune.com/feed/",
    category: "culture",
  },


  {
    name: "Annapurna Post",
    url: process.env.FEED_URL_15 || "https://annapurnapost.com/feed/",
    category: "politics",
  },
  {
    name: "Kantipur",
    url: process.env.FEED_URL_16 || "https://www.kantipurdaily.com/rss",
    category: "politics",
  },
  {
    name: "Karobar Daily",
    url: process.env.FEED_URL_17 || "https://www.karobardaily.com/feed",
    category: "economy",
  },
  {
    name: "Sharesansar",
    url: process.env.FEED_URL_18 || "https://www.sharesansar.com/feed",
    category: "economy",
  },
  {
    name: "Bizmandu",
    url: process.env.FEED_URL_19 || "https://bizmandu.com/rss",
    category: "economy",
  },
  {
    name: "Ekanthipur",
    url: process.env.FEED_URL_20 || "https://ekantipur.com/feed",
    category: "politics",
  },
  {
    name: "Sports Jana Aastha",
    url: process.env.FEED_URL_21 || "https://www.sportsjanaasthaepaper.com/feed/",
    category: "sports",
  },
];

const cacheDir = path.join(process.cwd(), ".news-cache");
const cacheFilePath = path.join(cacheDir, "published.json");
const isDirectRun =
  !!process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

async function ensureCacheDir() {
  await mkdir(cacheDir, { recursive: true });
}

async function readPublishedCache() {
  await ensureCacheDir();

  try {
    const raw = await readFile(cacheFilePath, "utf8");
    return JSON.parse(raw) as Array<{
      title: string;
      hash: string;
      sourceUrl: string;
    }>;
  } catch {
    return [] as Array<{ title: string; hash: string; sourceUrl: string }>;
  }
}

async function writePublishedCache(
  entries: Array<{ title: string; hash: string; sourceUrl: string }>,
) {
  await ensureCacheDir();
  await writeFile(cacheFilePath, JSON.stringify(entries, null, 2));
}

function getCategory(title: string, snippet: string, defaultCategory: string) {
  const text = `${title} ${snippet}`.toLowerCase();
  const categoryTerms: Record<string, string[]> = {
    sports: [
      "खेल",
      "क्रिकेट",
      "फुटबल",
      "football",
      "cricket",
      "sports",
      "olympic",
      "league",
      "player",
      "athlete",
      "match",
    ],
    technology: [
      "प्रविधि",
      "टेक",
      "technology",
      "tech",
      "software",
      "digital",
      "फोन",
      "मोबाइल",
      "ai",
      "gadget",
    ],
    economy: [
      "अर्थ",
      "बैंक",
      "बजेट",
      "business",
      "economy",
      "market",
      "bank",
      "रुपैयाँ",
      "लगानी",
      "शेयर",
      "व्यापार",
    ],
    culture: [
      "संस्कृति",
      "कला",
      "साहित्य",
      "culture",
      "festival",
      "music",
      "film",
      "tourism",
      "पर्यटन",
      "चाडपर्व",
    ],
  };

  for (const [category, terms] of Object.entries(categoryTerms)) {
    if (terms.some((term) => text.includes(term))) return category;
  }

  return defaultCategory;
}

function buildUnsplashImageUrl(topic: string) {
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
  };
  const category = topic.split(" ")[0]?.toLowerCase();
  return imageByCategory[category] || imageByCategory.culture;
}

export function hasDevanagari(value: string) {
  return /[\u0900-\u097f]/.test(value);
}

export function cleanText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHtml(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const cleanUrl = (url ?? "").trim();
    if (!cleanUrl || !cleanUrl.startsWith("http")) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      return null;
    }
    const html = await response.text();
    clearTimeout(timeoutId);
    return html;
  } catch {
    return null;
  }
}

function getSourceSelectors(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");

  const rules: Record<
    string,
    { title: string[]; description: string[]; body: string[]; image: string[] }
  > = {
    "onlinekhabar.com": {
      title: ["h1.title", "h1", ".story-title", ".article-title"],
      description: [
        "meta[name='description']",
        ".summary",
        ".article-summary",
        "p.lead",
      ],
      body: [
        ".ok18-single-post-content-wrap p",
        "article p",
        ".article-body p",
        ".story-content p",
        ".entry-content p",
        ".post-content p",
      ],
      image: [
        "meta[property='og:image']",
        "article img",
        ".article-image img",
        ".story-image img",
      ],
    },

    // Setopati has no proper html structure to extract the data
    "setopati.com": {
      title: ["h1", ".news-big-title", ".news-title", ".headline"],
      description: [
        "meta[name='description']",
        ".news-sub-heading",
        ".summary",
        ".lead",
      ],
      body: [
        ".editor-box p",
        ".content-editor p",
        ".news-detail-section p",
        ".detail-box p",
        "article p",
        ".content p",
        ".article-content p",
        ".story-content p",
        ".news-content p",
      ],
      image: [
        "meta[property='og:image']",
        "article img",
        ".content img",
        ".news-image img",
      ],
    },
    "ratopati.com": {
      title: ["h1", ".detail-title", ".headline"],
      description: ["meta[name='description']", ".summary", ".lead"],
      body: [
        ".detail-content p",
        "article p",
        ".story-content p",
        ".content p",
        ".article-content p",
      ],
      image: [
        "meta[property='og:image']",
        "article img",
        ".detail-image img",
        ".story-image img",
      ],
    },
    "nagariknews.nagariknetwork.com": {
      title: ["h1", ".headline", ".news-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: [
        "article p",
        ".content p",
        ".news-content p",
        ".story-content p",
        ".entry-content p",
      ],
      image: ["meta[property='og:image']", "article img", ".news-img img"],
    },
    "nepalitimes.com": {
      title: ["h1.entry-title", "h1", ".post-title"],
      description: [
        "meta[name='description']",
        ".entry-summary",
        ".post-excerpt",
      ],
      body: ["article p", ".entry-content p", ".post-content p", ".content p"],
      image: [
        "meta[property='og:image']",
        "article img",
        ".post-thumbnail img",
        ".entry-thumbnail img",
      ],
    },
    "thehimalayantimes.com": {
      title: ["h1.article-title", "h1", ".headline"],
      description: ["meta[name='description']", ".sub-title", ".lead"],
      body: ["article p", ".article-body p", ".story-content p", ".content p", ".post-content p"],
      image: [
        "meta[property='og:image']",
        "article img",
        ".featured-image img",
      ],
    },
    "kathmandutribune.com": {
      title: ["h1", ".entry-title", ".headline"],
      description: ["meta[name='description']", ".entry-summary", ".excerpt"],
      body: ["article p", ".entry-content p", ".content p"],
      image: ["meta[property='og:image']", "article img", ".entry-image img"],
    },
    "techmandu.com": {
      title: ["h1", ".entry-title"],
      description: ["meta[name='description']", ".excerpt"],
      body: ["article p", ".entry-content p", ".post-content p", ".content p"],
      image: ["meta[property='og:image']", "article img", ".featured-image img"],
    },
    "rajdhanidaily.com": {
      title: ["h1", ".news-title"],
      description: ["meta[name='description']", ".lead"],
      body: ["article p", ".entry-content p", ".content p", ".post-content p"],
      image: ["meta[property='og:image']", "article img"],
    },
    "newsofnepal.com": {
      title: ["h1", ".news-title"],
      description: ["meta[name='description']", ".lead"],
      body: ["article p", ".entry-content p", ".content p", ".post-content p"],
      image: ["meta[property='og:image']", "article img"],
    },
    "arthasarokar.com": {
      title: ["h1", ".post-title"],
      description: ["meta[name='description']", ".lead"],
      body: ["article p", ".entry-content p", ".content p", ".post-content p"],
      image: ["meta[property='og:image']", "article img"],
    },
    "ekantipur.com": {
      title: ["h1", ".article-title", ".news-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: ["article p", ".content p", ".article-content p", ".post-content p"],
      image: [
        "meta[property='og:image']",
        "article img",
        ".article-image img",
      ],
    },
    "kantipurdaily.com": {
      title: ["h1", ".article-title", ".news-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: ["article p", ".content p", ".article-content p", ".post-content p"],
      image: ["meta[property='og:image']", "article img"],
    },
    "annapurnapost.com": {
      title: ["h1", ".article-title", ".post-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: ["article p", ".article-content p", ".entry-content p", ".content p"],
      image: [
        "meta[property='og:image']",
        "article img",
        ".featured-image img",
      ],
    },
    "karobardaily.com": {
      title: ["h1", ".entry-title", ".post-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: ["article p", ".entry-content p", ".post-content p", ".content p"],
      image: ["meta[property='og:image']", "article img"],
    },
    "sharesansar.com": {
      title: ["h1", ".entry-title", ".post-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: ["article p", ".entry-content p", ".post-content p", ".content p"],
      image: ["meta[property='og:image']", "article img"],
    },
    "bizmandu.com": {
      title: ["h1", ".entry-title", ".post-title"],
      description: ["meta[name='description']", ".lead", ".summary"],
      body: ["article p", ".entry-content p", ".post-content p", ".content p"],
      image: ["meta[property='og:image']", "article img"],
    },
  };

  return (
    rules[hostname] ?? {
      title: ["h1", ".story-title", ".article-title", ".headline"],
      description: [
        "meta[name='description']",
        "p.lead",
        ".summary",
        ".excerpt",
      ],
      body: [
        "article p",
        ".article-content p",
        ".detail-content p",
        ".content p",
        ".entry-content p",
        ".story-content p",
        ".post-content p",
        "main p",
      ],
      image: [
        "meta[property='og:image']",
        "article img",
        "main img",
        ".content img",
      ],
    }
  );
}

function resolveImageUrl(value: string, baseUrl: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return new URL(value, baseUrl).toString();
  return value;
}

function isJunkParagraph(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 20) return true;

  const junkPatterns = [
    /^(खुसी|दुःखी|अचम्मित|उत्साहित|आक्रोशित|हास्यास्पद|चिन्ताजनक)$/,
    /^(अनलाइनखबर|सेतोपाटी|रातोपाटी|नागरिक|नागरिकन्यूज|राजधानी|टेकमण्डु)$/i,
    /सबैको.*सबैभन्दा राम्रो/,
    /डटकम।$/,
    /^forgot password/i,
    /^sign\s*(in|up)/i,
    /^log\s*(in|out)/i,
    /^subscribe/i,
    /^share\s/i,
    /^tags?\s*:/i,
    /^related\s/i,
    /^also\s+read/i,
    /पनि पढ्नुहोस्/,
    /यो पनि हेर्नुहोस्/,
    /^तपाईंको प्रतिक्रिया/,
    /^copyright/i,
    /©\s*\d{4}/i,
    /all rights reserved/i,
    /सर्वाधिकार सुरक्षित/,
    /\[email\s*protected\]/i,
    /^Bakhundole/i,
    /^\d{2,3}-\d{6,8}/,
  ];

  return junkPatterns.some((pattern) => pattern.test(trimmed));
}


function extractPageData(
  html: string,
  fallback: { title: string; snippet: string; source: string; link: string },
) {
  const $ = load(html);

  // Remove noise elements
  $(
    "script, style, noscript, svg, form, iframe, header, footer, nav, aside, .advertisement, .ads, .social-share, .share-box, .fb-comments, .comments, .related-posts, .related-news, .recommended, .sidebar, .tags, .author-bio",
  ).remove();

  const siteRules = getSourceSelectors(fallback.link);
  const candidateRoot = $(
    "article, main, .article-content, .entry-content, .post-content, .story-content, .news-content, .detail-content",
  ).first();

  const structuredBlocks = $('script[type="application/ld+json"]').toArray();
  let structuredData: Record<string, unknown> | null = null;

  for (const block of structuredBlocks) {
    const raw = $(block).html() ?? "";
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const flattened = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of flattened) {
        if (
          item &&
          typeof item === "object" &&
          ("headline" in item || "articleBody" in item || "description" in item)
        ) {
          structuredData = item as Record<string, unknown>;
          break;
        }
      }

      if (structuredData) break;
    } catch {
      // Ignore malformed JSON-LD
    }
  }

  const structuredHeadline =
    typeof structuredData?.headline === "string"
      ? structuredData.headline
      : typeof structuredData?.name === "string"
        ? structuredData.name
        : "";

  const structuredDescription =
    typeof structuredData?.description === "string"
      ? structuredData.description
      : typeof structuredData?.abstract === "string"
        ? structuredData.abstract
        : "";

  const structuredImageValue =
    typeof structuredData?.image === "string"
      ? structuredData.image
      : Array.isArray(structuredData?.image)
        ? structuredData.image[0]
        : typeof structuredData?.image === "object" &&
          structuredData.image !== null
          ? ((structuredData.image as Record<string, unknown>).url ??
            (structuredData.image as Record<string, unknown>).contentUrl ??
            "")
          : "";

  const structuredBodySource =
    typeof structuredData?.articleBody === "string"
      ? structuredData.articleBody
      : Array.isArray(structuredData?.articleBody)
        ? structuredData.articleBody.join("\n\n")
        : "";

  const paragraphs = (() => {
    const extracted: string[] = [];

    if (structuredBodySource) {
      const split = structuredBodySource
        .replace(/<[^>]+>/g, " ")
        .split(/\n{2,}|\.(?=\s+[A-Z])/)
        .map((part) => cleanText(part))
        .filter((part) => part.length > 20 && !isJunkParagraph(part));
      extracted.push(...split);
    }

    const sourceSelectors = [
      ...siteRules.body,
      "article p",
      ".article-content p",
      ".detail-content p",
      ".entry-content p",
      ".post-content p",
      ".story-content p",
      ".news-content p",
      "main p",
    ];

    for (const selector of sourceSelectors) {
      const nodes = $(selector).toArray();
      for (const node of nodes) {
        const text = cleanText($(node).text());
        if (!text || text.length <= 20) continue;
        if (isJunkParagraph(text)) continue;
        if (extracted.some((item) => item === text)) continue;
        extracted.push(text);
      }
    }

    return extracted.filter(
      (paragraph) => paragraph.length > 20 && !isJunkParagraph(paragraph),
    );
  })();

  const titleFromSelectors = siteRules.title
    .map((selector) => cleanText($(selector).first().text()))
    .find(Boolean);

  const descriptionFromSelectors = siteRules.description
    .flatMap((selector) => {
      const node = $(selector).first();
      if (node.length === 0) return [];
      const value = node.attr("content") || node.text();
      return [cleanText(value)];
    })
    .find(Boolean);

  const title = cleanText(
    structuredHeadline ||
    titleFromSelectors ||
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $('meta[name="title"]').attr("content") ||
    candidateRoot.find("h1").first().text() ||
    $("h1").first().text() ||
    fallback.title,
  );

  const excerpt = cleanText(
    structuredDescription ||
    descriptionFromSelectors ||
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    paragraphs[0] ||
    candidateRoot.find("p").first().text() ||
    $("p").first().text() ||
    fallback.snippet,
  ).slice(0, 260);

  const imageUrlFromSelectors = siteRules.image
    .flatMap((selector) => {
      const node = $(selector).first();
      if (node.length === 0) return [];
      return [
        resolveImageUrl(
          node.attr("src") ||
          node.attr("content") ||
          node.attr("data-src") ||
          "",
          fallback.link,
        ),
      ];
    })
    .find(Boolean);

  const imageUrl =
    (typeof structuredImageValue === "string"
      ? resolveImageUrl(structuredImageValue, fallback.link)
      : "") ||
    imageUrlFromSelectors ||
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    candidateRoot.find("img").first().attr("src") ||
    $("img").first().attr("src") ||
    buildUnsplashImageUrl(fallback.source);

  const publishedAt =
    typeof structuredData?.datePublished === "string"
      ? structuredData.datePublished
      : $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="pubdate"]').attr("content") ||
      $("time").first().attr("datetime") ||
      new Date().toISOString();

  const body =
    paragraphs.length > 0
      ? paragraphs
      : [
        excerpt || fallback.snippet,
        `This story was originally published by ${fallback.source}. The source link is included below for direct review and additional context.`,
      ];

  return {
    title,
    excerpt,
    body,
    imageUrl,
    publishedAt,
  };
}

export function isInvalidTranslationText(text: string | null | undefined): boolean {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("invalid source language") ||
    lower.includes("invalid target language") ||
    lower.includes("langpair=") ||
    lower.includes("mymemory warning") ||
    lower.includes("quota finished") ||
    lower.includes("query length limit") ||
    lower.includes("using 2 letter iso") ||
    lower.includes("rfc3066") ||
    lower.includes("almost all languages supported") ||
    lower.includes("is an invalid source language") ||
    lower.includes("auto is an invalid") ||
    lower.includes("auto-is-an-invalid") ||
    lower.includes("daily limit reached") ||
    lower.includes("mymemory")
  );
}

const translationCache = new Map<string, string>();

export async function translateSingle(
  value: string,
  target: "en" | "ne",
  timeoutMs = 3000,
): Promise<string> {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (target === "ne" && hasDevanagari(trimmed)) return trimmed;
  if (target === "en" && !hasDevanagari(trimmed) && !isInvalidTranslationText(trimmed)) return trimmed;

  const cacheKey = `${target}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const source = target === "en" ? "ne" : "en";

  for (let attempt = 0; attempt < 2; attempt++) {
    // 1. Google Translate GTX
    try {
      const url = new URL("https://translate.googleapis.com/translate_a/single");
      url.searchParams.set("client", "gtx");
      url.searchParams.set("sl", source);
      url.searchParams.set("tl", target);
      url.searchParams.set("dt", "t");
      url.searchParams.set("q", trimmed);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      });
      const data = response.ok ? ((await response.json()) as Array<Array<[string]>>) : null;
      clearTimeout(timeoutId);

      if (data && Array.isArray(data[0])) {
        const translated = data[0].map((part) => part[0]).join("") || "";
        if (
          translated &&
          !isInvalidTranslationText(translated) &&
          ((target === "ne" && hasDevanagari(translated)) ||
            (target === "en" && !hasDevanagari(translated)))
        ) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    } catch {
      // Ignore and try next provider
    }

    // 2. Google Translate dict-chrome-ex fallback
    try {
      const dictUrl = new URL("https://clients5.google.com/translate_a/t");
      dictUrl.searchParams.set("client", "dict-chrome-ex");
      dictUrl.searchParams.set("sl", source);
      dictUrl.searchParams.set("tl", target);
      dictUrl.searchParams.set("q", trimmed);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const dictResponse = await fetch(dictUrl.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      });
      const dictResult = dictResponse.ok ? await dictResponse.json() : null;
      clearTimeout(timeoutId);

      if (dictResult) {
        const translated = Array.isArray(dictResult) ? dictResult[0] : typeof dictResult === "string" ? dictResult : "";
        if (
          translated &&
          !isInvalidTranslationText(translated) &&
          ((target === "ne" && hasDevanagari(translated)) ||
            (target === "en" && !hasDevanagari(translated)))
        ) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    } catch {
      // Ignore and try next provider
    }

    // 3. MyMemory Fallback with correct 2-letter language pair (ne|en or en|ne)
    try {
      const fallbackUrl = new URL("https://api.mymemory.translated.net/get");
      fallbackUrl.searchParams.set("q", trimmed);
      fallbackUrl.searchParams.set("langpair", `${source}|${target}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const fbResponse = await fetch(fallbackUrl.toString(), {
        signal: controller.signal,
      });
      const fbResult = fbResponse.ok
        ? ((await fbResponse.json()) as {
          responseData?: { translatedText?: string };
          responseStatus?: number;
        })
        : null;
      clearTimeout(timeoutId);

      if (fbResult && fbResult.responseStatus === 200) {
        const text = fbResult.responseData?.translatedText;
        if (text && !isInvalidTranslationText(text)) {
          if (target === "ne" && hasDevanagari(text)) {
            translationCache.set(cacheKey, text);
            return text;
          }
          if (target === "en" && !hasDevanagari(text)) {
            translationCache.set(cacheKey, text);
            return text;
          }
        }
      }
    } catch {
      // Ignore
    }

    if (attempt === 0 && hasTimeRemaining(30_000)) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return trimmed;
}

export async function translateParagraphList(
  paragraphs: string[],
  target: "en" | "ne",
): Promise<string[]> {
  const validParagraphs = paragraphs
    .map((p) => cleanText(p))
    .filter((p) => p.length > 0 && !isInvalidTranslationText(p))

  if (validParagraphs.length === 0) return [];

  const results: string[] = [];
  const batchSize = 3;
  for (let i = 0; i < validParagraphs.length; i += batchSize) {
    const batch = validParagraphs.slice(i, i + batchSize);
    const translatedBatch = await Promise.all(
      batch.map(async (cleanP) => {
        try {
          const translated = await translateSingle(cleanP, target);
          return !isInvalidTranslationText(translated) ? translated : cleanP;
        } catch {
          return cleanP;
        }
      }),
    );
    results.push(...translatedBatch);
  }

  return results;
}

async function fetchFeedEntries() {
  const feedPromises = defaultFeeds.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items ?? []).slice(0, 5);
      const feedEntries: Array<{
        title: string;
        link: string;
        snippet: string;
        category: string;
        source: string;
      }> = [];

      for (const item of items) {
        const title = (item.title ?? "Untitled update").trim();
        if (!title) continue;

        const snippet =
          item.contentSnippet ?? item.content ?? "Fresh reporting from Nepal.";

        const cleanLink = (item.link ?? "").trim();
        feedEntries.push({
          title,
          link: cleanLink || `https://example.com/${encodeURIComponent(title)}`,
          snippet,
          category: getCategory(title, snippet, feed.category),
          source: feed.name,
        });
      }
      return feedEntries;
    } catch (error) {
      console.warn(`Skipping feed ${feed.name}: ${(error as Error).message}`);
      return [];
    }
  });

  const settled = await Promise.allSettled(feedPromises);
  const entries: Array<{
    title: string;
    link: string;
    snippet: string;
    category: string;
    source: string;
  }> = [];

  for (const res of settled) {
    if (res.status === "fulfilled") {
      entries.push(...res.value);
    }
  }

  return entries;
}

export function makeSlug(title: string) {
  if (isInvalidTranslationText(title)) {
    return "nepal-news";
  }
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return clean || "nepal-news";
}

async function ensureCategory(categorySlug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug));
  if (rows.length > 0) return rows[0].id;

  const row = await db
    .insert(categories)
    .values({
      slug: categorySlug,
      nameEn: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
      nameNe:
        categorySlug === "politics"
          ? "राजनीति"
          : categorySlug === "economy"
            ? "अर्थव्यवस्था"
            : categorySlug === "technology"
              ? "प्रविधि"
              : categorySlug === "culture"
                ? "संस्कृति"
                : "खेल",
    })
    .returning({ id: categories.id });

  return row[0]?.id ?? null;
}

async function ensureSource(sourceName: string, sourceUrl: string) {
  const normalized = sourceName.trim();
  const rows = await db
    .select()
    .from(sources)
    .where(eq(sources.name, normalized));
  if (rows.length > 0) return rows[0].id;

  const row = await db
    .insert(sources)
    .values({
      name: normalized,
      baseUrl: new URL(sourceUrl).origin,
      feedUrl: sourceUrl,
      type: "news",
      isActive: true,
    })
    .returning({ id: sources.id });

  return row[0]?.id ?? null;
}

async function saveToDatabase(payload: Array<Record<string, unknown>>) {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set; skipping database write.");
    return;
  }

  try {
    const rows = await Promise.all(
      payload.map(async (item) => {
        const record = item as Record<string, unknown>;
        const categorySlug = String(record.category ?? "politics");
        const sourceName = String(record.sourceName ?? "TaajaSamachar");
        const sourceUrl = String(
          record.sourceUrl ?? "https://www.nepalnews.com",
        );
        const categoryId = await ensureCategory(categorySlug);
        const sourceId = await ensureSource(sourceName, sourceUrl);

        const articleTitle = String(record.titleEn ?? record.title ?? "");
        const articleSnippet = String(record.excerptEn ?? record.excerpt ?? "");
        const inferredCategoryId = inferCategoryIdFromText(
          articleTitle,
          articleSnippet,
          (await db.select().from(categories)).map((row) => ({
            id: row.id,
            slug: row.slug,
          })),
          categorySlug,
        );

        return {
          slugEn: String(record.slugEn ?? ""),
          slugNe: String(record.slugNe ?? ""),
          titleEn: String(record.titleEn ?? ""),
          titleNe: String(record.titleNe ?? ""),
          excerptEn: String(record.excerptEn ?? ""),
          excerptNe: String(record.excerptNe ?? ""),
          bodyEn: String(record.bodyEn ?? ""),
          bodyNe: String(record.bodyNe ?? ""),
          metaDescriptionEn: String(record.metaDescriptionEn ?? ""),
          metaDescriptionNe: String(record.metaDescriptionNe ?? ""),
          categoryId: inferredCategoryId ?? categoryId ?? null,
          sourceId: sourceId ?? null,
          sourceUrl: sourceUrl,
          sourceHeadline: String(record.sourceHeadline ?? articleTitle),
          contentHash: String(record.contentHash ?? contentHash(articleTitle)),
          imageUrl: String(record.imageUrl ?? ""),
          imageAlt: String(record.imageAlt ?? articleTitle),
          imageCredit: String(record.imageCredit ?? sourceName),
          status: String(record.status ?? "published"),
          publishedAt:
            record.publishedAt instanceof Date
              ? record.publishedAt
              : new Date(),
        };
      }),
    );

    await db
      .insert(articles)
      .values(rows as any)
      .onConflictDoNothing();
    console.log(`Saved ${rows.length} articles to PostgreSQL.`);
  } catch (error) {
    console.warn("Database insert failed:", (error as Error).message);
  }
}

export async function runNewsFetch() {
  const entries = await fetchFeedEntries();
  const existing = await readPublishedCache();
  const unique: Array<{
    title: string;
    link: string;
    snippet: string;
    category: string;
    source: string;
  }> = [];

  for (const entry of entries) {
    const hash = contentHash(entry.title);
    const seen = existing.some((item) => item.hash === hash);
    if (seen) continue;

    const duplicate = isDuplicateCandidate(
      entry.title,
      existing.map((item) => item.title),
    );

    if (!duplicate) {
      unique.push(entry);
    }
  }

  const selectedCandidates = unique.slice(0, 8);
  const processedPayload: Array<any> = [];

  for (const entry of selectedCandidates) {
    if (!hasTimeRemaining(25_000)) {
      console.warn("Time limit approaching. Finalizing already fetched stories.");
      break;
    }

    try {
      const fallbackTitle = entry.title.trim();
      const fetched = await fetchHtml(entry.link, 5000);
      const pageData = fetched
        ? extractPageData(fetched, {
          title: fallbackTitle,
          snippet: entry.snippet,
          source: entry.source,
          link: entry.link,
        })
        : {
          title: fallbackTitle,
          excerpt: entry.snippet,
          body: [entry.snippet],
          imageUrl: buildUnsplashImageUrl(entry.category),
          publishedAt: new Date().toISOString(),
        };

      const rawTitle = pageData.title || fallbackTitle;
      const rawExcerpt =
        pageData.excerpt || entry.snippet || "Fresh reporting from Nepal.";
      const rawBodyParagraphs = pageData.body
        .map((p) => cleanText(p))
        .filter((p) => p.length > 20 && !isJunkParagraph(p));

      const sourceIsNepali =
        hasDevanagari(rawTitle) ||
        hasDevanagari(rawExcerpt) ||
        rawBodyParagraphs.some(hasDevanagari);

      let titleEn = "";
      let titleNe = "";
      let excerptEn = "";
      let excerptNe = "";
      let englishParagraphs: string[] = [];
      let nepaliParagraphs: string[] = [];

      if (sourceIsNepali) {
        // Source is Nepali: preserve original Nepali and translate to English
        titleNe = rawTitle;
        excerptNe = rawExcerpt;
        nepaliParagraphs =
          rawBodyParagraphs.length > 0 ? rawBodyParagraphs : [rawExcerpt];

        titleEn = await translateSingle(rawTitle, "en");
        excerptEn = await translateSingle(rawExcerpt, "en");
        englishParagraphs = await translateParagraphList(
          nepaliParagraphs,
          "en",
        );

        // If English translation retained Devanagari due to fallback or is an error, clean it
        if (hasDevanagari(titleEn) || isInvalidTranslationText(titleEn)) {
          titleEn = "Nepal News: " + entry.source;
        }
        if (hasDevanagari(excerptEn) || isInvalidTranslationText(excerptEn)) {
          excerptEn = "Latest reporting and updates from Nepal.";
        }
        englishParagraphs = englishParagraphs
          .filter((p) => !isInvalidTranslationText(p))
          .map((p) =>
            hasDevanagari(p)
              ? `Reported developments regarding this story continue to unfold from ${entry.source}.`
              : p,
          );
      } else {
        // Source is English: preserve original English and translate to Nepali
        titleEn = rawTitle;
        excerptEn = rawExcerpt;
        englishParagraphs =
          rawBodyParagraphs.length > 0 ? rawBodyParagraphs : [rawExcerpt];

        titleNe = await translateSingle(rawTitle, "ne");
        excerptNe = await translateSingle(rawExcerpt, "ne");
        nepaliParagraphs = await translateParagraphList(
          englishParagraphs,
          "ne",
        );

        if (!hasDevanagari(titleNe) || isInvalidTranslationText(titleNe)) {
          titleNe = rawTitle;
        }
        if (!hasDevanagari(excerptNe) || isInvalidTranslationText(excerptNe)) {
          excerptNe = rawExcerpt;
        }
        nepaliParagraphs = nepaliParagraphs.filter((p) => !isInvalidTranslationText(p));
      }

      const sourceCategory = inferCategorySlugFromText(
        titleEn || titleNe,
        `${excerptEn} ${englishParagraphs.join(" ")}`,
        entry.category,
      );

      const slugSeed =
        (!isInvalidTranslationText(titleEn) && titleEn) ||
        (!isInvalidTranslationText(rawTitle) && rawTitle) ||
        "nepal-news";
      const slug = makeSlug(slugSeed);
      const timestamp = Date.now();

      const bodyEnHtml = toRichHtml(englishParagraphs.join("\n\n"), "en");
      const bodyNeHtml = toRichHtml(
        normalizeNepaliText(nepaliParagraphs.join("\n\n")),
        "ne",
      );

      processedPayload.push({
        slugEn: `${slug}-en-${timestamp}`,
        slugNe: `${slug}-ne-${timestamp}`,
        titleEn,
        titleNe,
        excerptEn,
        excerptNe,
        bodyEn: bodyEnHtml,
        bodyNe: bodyNeHtml,
        metaDescriptionEn: excerptEn.slice(0, 155),
        metaDescriptionNe: excerptNe.slice(0, 150),
        sourceUrl: entry.link,
        sourceHeadline: rawTitle,
        contentHash: contentHash(entry.title),
        imageUrl: pageData.imageUrl || buildUnsplashImageUrl(sourceCategory),
        imageAlt: `${titleEn || titleNe} image`,
        imageCredit: entry.source,
        sourceName: entry.source,
        publishedAt: new Date(pageData.publishedAt),
        status: "published",
        category: sourceCategory,
        hash: contentHash(entry.title),
        title: entry.title,
      });
    } catch (error) {
      console.warn(
        `Failed processing entry "${entry.title}": ${(error as Error).message}`,
      );
    }
  }

  const payload = processedPayload;

  const updatedCache = [
    ...existing,
    ...payload.map(({ hash, title, sourceUrl }) => ({
      hash,
      title,
      sourceUrl,
    })),
  ];
  await writePublishedCache(updatedCache);

  if (payload.length > 0) {
    await saveToDatabase(
      payload.map(({ hash, title, ...article }) => ({
        ...article,
      })),
    );
  }

  const result = {
    candidatesFound: entries.length,
    deduped: Math.max(0, entries.length - unique.length),
    published: payload.length,
    sources: defaultFeeds.length,
  };

  console.log(
    `Fetched ${entries.length} candidate entries; published ${payload.length} new stories.`,
  );

  return result;
}

if (isDirectRun) {
  const globalSafetyTimer = setTimeout(() => {
    console.warn("Global safety timeout reached (230s). Terminating process.");
    process.exit(0);
  }, 230_000);
  globalSafetyTimer.unref();

  runNewsFetch()
    .then(() => {
      console.log("News fetch cycle completed successfully.");
    })
    .catch((error) => {
      console.error("News fetch failed:", error);
    })
    .finally(async () => {
      try {
        await closeDatabase();
      } catch (error) {
        console.warn(
          "Database connection close failed:",
          (error as Error).message,
        );
      }
      process.exit(0);
    });
}
