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

const parser = new Parser();

const defaultFeeds = [
  {
    name: "Online Khabar",
    url: process.env.FEED_URL_1 || "https://www.onlinekhabar.com/feed",
    category: "economy",
  },
  {
    name: "Setopati",
    url: process.env.FEED_URL_2 || "https://www.setopati.com/feed",
    category: "politics",
  },
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

function hasDevanagari(value: string) {
  return /[\u0900-\u097f]/.test(value);
}

function cleanText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) return null;
    return await response.text();
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
        "article p",
        ".article-body p",
        ".story-content p",
        ".entry-content p",
      ],
      image: [
        "meta[property='og:image']",
        "article img",
        ".article-image img",
        ".story-image img",
      ],
    },
    "setopati.com": {
      title: ["h1", ".news-title", ".headline"],
      description: ["meta[name='description']", ".summary", ".lead"],
      body: [
        "article p",
        ".content p",
        ".article-content p",
        ".story-content p",
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
        "article p",
        ".detail-content p",
        ".story-content p",
        ".content p",
      ],
      image: [
        "meta[property='og:image']",
        "article img",
        ".detail-image img",
        ".story-image img",
      ],
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
      body: ["article p", ".article-body p", ".story-content p", ".content p"],
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
        ".content p",
        ".entry-content p",
        ".story-content p",
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
    // Nepali news site reaction/emoji labels
    /^(खुसी|दुःखी|अचम्मित|उत्साहित|आक्रोशित|हास्यास्पद|चिन्ताजनक)$/,
    // Site branding / taglines
    /^(अनलाइनखबर|सेतोपाटी|रातोपाटी|नागरिक|नागरिकन्यूज)$/i,
    /सबैको.*सबैभन्दा राम्रो/,
    /डटकम।$/,
    // Auth / UI elements
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
    // Copyright / legal
    /^copyright/i,
    /©\s*\d{4}/i,
    /all rights reserved/i,
    /सर्वाधिकार सुरक्षित/,
    // Contact info / addresses
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
      // Ignore malformed JSON-LD from some sites.
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



  const sourceSelectors = [
    "article p",
    ".article-content p",
    ".entry-content p",
    ".post-content p",
    ".story-content p",
    ".news-content p",
    ".detail-content p",
    "main p",
    "p",
  ];

  const paragraphs = (() => {
    const extracted = [] as string[];

    if (structuredBodySource) {
      const split = structuredBodySource
        .replace(/<[^>]+>/g, " ")
        .split(/\n{2,}|\.(?=\s+[A-Z])/)
        .map((part) => cleanText(part))
        .filter((part) => part.length > 20 && !isJunkParagraph(part));
      extracted.push(...split);
    }

    for (const selector of sourceSelectors) {
      // Once we have enough from a scoped selector, skip broader ones
      if (extracted.length >= 50) break;
      const nodes = $(selector).toArray();
      for (const node of nodes) {
        const text = cleanText($(node).text());
        if (!text || text.length <= 20) continue;
        if (isJunkParagraph(text)) continue;
        if (extracted.some((item) => item === text)) continue;
        extracted.push(text);
      }
      // If a scoped selector found content, don't fall through to broader ones
      if (extracted.length > 0 && selector !== "p") break;
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
      const value = node.attr("content") || node.attr("content") || node.text();
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
  ).slice(0, 220);

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

async function translateToNepali(title: string, excerpt: string, body: string) {
  if (hasDevanagari(title) && hasDevanagari(excerpt) && hasDevanagari(body)) {
    return { title, excerpt, body };
  }

  async function translate(value: string) {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", "ne");
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", value);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google translation failed with HTTP ${response.status}`);
    }

    const result = (await response.json()) as Array<Array<[string]>>;
    const translated = result[0]?.map((part) => part[0]).join("") || value;
    if (!hasDevanagari(translated)) {
      throw new Error("Google returned no Nepali Unicode text");
    }
    return translated;
  }

  const paragraphs = body.split(/\n\s*\n/).filter(Boolean);
  const [translatedTitle, translatedExcerpt, translatedParagraphs] =
    await Promise.all([
      translate(title),
      translate(excerpt),
      Promise.all(paragraphs.map((paragraph) => translate(paragraph))),
    ]);

  return {
    title: translatedTitle,
    excerpt: translatedExcerpt,
    body: translatedParagraphs.join("\n\n"),
  };
}

async function translateToEnglish(value: string) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", "en");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", value);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Google translation failed with HTTP ${response.status}`);
  const result = (await response.json()) as Array<Array<[string]>>;
  return result[0]?.map((part) => part[0]).join("") || value;
}

async function fetchFeedEntries() {
  const entries: Array<{
    title: string;
    link: string;
    snippet: string;
    category: string;
    source: string;
  }> = [];

  for (const feed of defaultFeeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items ?? []).slice(0, 5);

      for (const item of items) {
        const title = (item.title ?? "Untitled update").trim();
        if (!title) continue;

        const snippet =
          item.contentSnippet ?? item.content ?? "Fresh reporting from Nepal.";

        entries.push({
          title,
          link: item.link ?? `https://example.com/${encodeURIComponent(title)}`,
          snippet,
          category: getCategory(title, snippet, feed.category),
          source: feed.name,
        });
      }
    } catch (error) {
      console.warn(`Skipping feed ${feed.name}: ${(error as Error).message}`);
    }
  }

  return entries;
}

function makeSlug(title: string) {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return clean || "nepal-news";
}

async function toArticlePayload(entry: {
  title: string;
  link: string;
  snippet: string;
  category: string;
  source: string;
}) {
  const fallbackTitle = entry.title.trim();
  const fetched = await fetchHtml(entry.link);
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

  const title = pageData.title || fallbackTitle;
  const excerpt =
    pageData.excerpt || entry.snippet || "Fresh reporting from Nepal.";
  const normalizedBody = pageData.body
    .map((paragraph) => cleanText(paragraph))
    .filter((paragraph) => paragraph.length > 25 && !isJunkParagraph(paragraph))
    .join("\n\n");
  const bodyText = normalizedBody || `${title}. ${excerpt}`;
  const sourceCategory = inferCategorySlugFromText(
    title,
    `${excerpt} ${bodyText}`,
    entry.category,
  );
  const slug = makeSlug(title);

  return {
    slugEn: `${slug}-en-${Date.now()}`,
    slugNe: `${slug}-ne-${Date.now()}`,
    titleEn: title,
    titleNe: title,
    excerptEn: excerpt,
    excerptNe: excerpt,
    bodyEn: toRichHtml(bodyText, "en"),
    bodyNe: toRichHtml(bodyText, "ne"),
    metaDescriptionEn: excerpt.slice(0, 155),
    metaDescriptionNe: excerpt.slice(0, 150),
    sourceUrl: entry.link,
    sourceHeadline: title,
    contentHash: contentHash(title),
    imageUrl: pageData.imageUrl || buildUnsplashImageUrl(sourceCategory),
    imageAlt: `${title} image`,
    imageCredit: entry.source,
    sourceName: entry.source,
    publishedAt: new Date(pageData.publishedAt),
    status: "published",
    category: sourceCategory,
  };
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
        const sourceName = String(record.sourceName ?? "Nepal News Pulse");
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

  const translatedPayload = await Promise.all(
    unique.slice(0, 8).map(async (entry) => {
      const article = await toArticlePayload(entry);
      const originalTitle = article.titleEn;
      const originalExcerpt = article.excerptEn;

      if (hasDevanagari(originalTitle)) {
        try {
          const [titleEn, excerptEn] = await Promise.all([
            translateToEnglish(originalTitle),
            translateToEnglish(originalExcerpt),
          ]);
          article.titleEn = titleEn;
          article.excerptEn = excerptEn;
        } catch (error) {
          console.warn(
            `English translation skipped for ${entry.title}: ${(error as Error).message}`,
          );
          return null;
        }
      }

      let nepali = {
        title: article.titleNe,
        excerpt: article.excerptNe,
        body: article.bodyNe,
      };

      try {
        nepali = await translateToNepali(
          article.titleEn,
          article.excerptEn,
          article.bodyEn,
        );
      } catch (error) {
        console.warn(
          `Nepali translation skipped for ${entry.title}: ${(error as Error).message}`,
        );
        return null;
      }

      return {
        ...article,
        titleNe: nepali.title,
        excerptNe: nepali.excerpt,
        bodyNe: normalizeNepaliText(nepali.body),
        hash: contentHash(entry.title),
        title: entry.title,
      };
    }),
  );
  const payload = translatedPayload.filter(
    (article): article is NonNullable<typeof article> => article !== null,
  );

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
      payload.map(({ hash, title, sourceUrl, ...article }) => ({
        ...article,
        contentHash: hash,
        sourceUrl,
        sourceHeadline: title,
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
  runNewsFetch()
    .catch((error) => {
      console.error("News fetch failed:", error);
      process.exitCode = 1;
    })
    .finally(() =>
      closeDatabase().catch((error) => {
        console.warn(
          "Database connection close failed:",
          (error as Error).message,
        );
      }),
    );
}
