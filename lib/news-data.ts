import { and, desc, eq, ilike, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { articles, categories } from "@/lib/db/schema";
import { categories as fallbackCategories } from "@/lib/site";
import { normalizeNepaliText, toRichHtml } from "@/lib/article-content";

export type NewsArticle = {
  id: number;
  slug: string;
  slugEn: string;
  slugNe: string;
  title: { ne: string; en: string };
  excerpt: { ne: string; en: string };
  body: { ne: string[]; en: string[] };
  bodyHtml: { ne: string; en: string };
  category: string;
  image: string;
  imageAlt: { ne: string; en: string };
  imageCredit?: string | null;
  imageCreditUrl?: string | null;
  publishedAt: string;
  source: string;
  sourceUrl: string;
  likesCount: number;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80";

function toParagraphs(value: string | null | undefined) {
  if (!value) return ["Latest Nepal news update."];

  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

type FeedRow = {
  id: number;
  slugEn: string;
  slugNe: string;
  titleEn: string;
  titleNe: string;
  excerptEn: string;
  excerptNe: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: Date | string | null;
  categorySlug: string | null;
};

type DetailRow = FeedRow & {
  bodyEn: string;
  bodyNe: string;
  imageCredit: string | null;
  imageCreditUrl: string | null;
  likesCount: number | null;
};

function toFeedArticle(row: FeedRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slugEn,
    slugEn: row.slugEn,
    slugNe: row.slugNe,
    title: {
      ne: row.titleNe,
      en: row.titleEn,
    },
    excerpt: {
      ne: row.excerptNe,
      en: row.excerptEn,
    },
    body: {
      ne: [],
      en: [],
    },
    bodyHtml: {
      ne: "",
      en: "",
    },
    category: row.categorySlug || "general",
    image: row.imageUrl || FALLBACK_IMAGE,
    imageAlt: {
      ne: row.titleNe,
      en: row.titleEn,
    },
    publishedAt: row.publishedAt
      ? new Date(row.publishedAt).toISOString()
      : new Date().toISOString(),
    source: "Nepali Samachar",
    sourceUrl: "/",
    likesCount: 0,
  };
}

function toArticleRecord(row: DetailRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slugEn,
    slugEn: row.slugEn,
    slugNe: row.slugNe,
    title: {
      ne: row.titleNe,
      en: row.titleEn,
    },
    excerpt: {
      ne: row.excerptNe,
      en: row.excerptEn,
    },
    body: {
      ne: toParagraphs(row.bodyNe),
      en: toParagraphs(row.bodyEn),
    },
    bodyHtml: {
      ne: row.bodyNe.includes("<p")
        ? normalizeNepaliText(row.bodyNe)
        : toRichHtml(normalizeNepaliText(row.bodyNe), "ne"),
      en: row.bodyEn.includes("<p") ? row.bodyEn : toRichHtml(row.bodyEn),
    },
    category: row.categorySlug || "general",
    image: row.imageUrl || FALLBACK_IMAGE,
    imageAlt: {
      ne: row.titleNe,
      en: row.titleEn,
    },
    imageCredit: row.imageCredit ?? null,
    imageCreditUrl: row.imageCreditUrl ?? null,
    publishedAt: row.publishedAt
      ? new Date(row.publishedAt).toISOString()
      : new Date().toISOString(),
    source: "Nepali Samachar",
    sourceUrl: "/",
    likesCount: row.likesCount ?? 0,
  };
}

const feedFields = {
  id: articles.id,
  slugEn: articles.slugEn,
  slugNe: articles.slugNe,
  titleEn: articles.titleEn,
  titleNe: articles.titleNe,
  excerptEn: articles.excerptEn,
  excerptNe: articles.excerptNe,
  imageUrl: articles.imageUrl,
  imageAlt: articles.imageAlt,
  publishedAt: articles.publishedAt,
  categorySlug: categories.slug,
};

const detailFields = {
  ...feedFields,
  bodyEn: articles.bodyEn,
  bodyNe: articles.bodyNe,
  imageCredit: articles.imageCredit,
  imageCreditUrl: articles.imageCreditUrl,
  likesCount: articles.likesCount,
};

async function withFallback<T>(
  callback: () => Promise<T>,
  fallbackValue: T,
): Promise<T> {
  try {
    return await callback();
  } catch {
    return fallbackValue;
  }
}

export async function getCategories() {
  return await withFallback(async () => {
    const rows = await db.select().from(categories).orderBy(categories.slug);

    if (rows.length === 0) {
      return fallbackCategories;
    }

    return rows.map((row) => ({
      slug: row.slug,
      name: {
        ne: row.nameNe,
        en: row.nameEn,
      },
    }));
  }, fallbackCategories);
}

export async function getAllArticleSlugs(limit = 60) {
  return await withFallback(async () => {
    const rows = await db
      .select({ slugEn: articles.slugEn, slugNe: articles.slugNe })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return rows.flatMap((row) => [
      { locale: "ne", slug: row.slugNe },
      { locale: "en", slug: row.slugEn },
    ]);
  }, []);
}

async function fetchLatestArticles(limit = 9) {
  return await withFallback(async () => {
    const rows = await db
      .select(feedFields)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return rows.map((row) => toFeedArticle(row as FeedRow));
  }, []);
}

export async function getLatestArticles(limit = 9) {
  return fetchLatestArticles(limit);
}

export const getHomepageFeed = unstable_cache(
  () => fetchLatestArticles(24),
  ["homepage-feed"],
  { revalidate: 1800, tags: ["articles", "homepage"] },
);

async function fetchArticleBySlug(locale: "ne" | "en", slug: string) {
  return await withFallback(async () => {
    const rows =
      locale === "ne"
        ? await db
          .select(detailFields)
          .from(articles)
          .leftJoin(categories, eq(articles.categoryId, categories.id))
          .where(eq(articles.slugNe, slug))
          .limit(1)
        : await db
          .select(detailFields)
          .from(articles)
          .leftJoin(categories, eq(articles.categoryId, categories.id))
          .where(eq(articles.slugEn, slug))
          .limit(1);

    return rows[0] ? toArticleRecord(rows[0] as DetailRow) : null;
  }, null);
}

export const getArticleBySlug = unstable_cache(
  (locale: "ne" | "en", slug: string) => fetchArticleBySlug(locale, slug),
  ["article-detail"],
  { revalidate: 21600, tags: ["article-detail"] },
);

export async function getArticlesByCategory(categorySlug: string, limit = 30) {
  return await withFallback(async () => {
    const rows = await db
      .select(feedFields)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(categories.slug, categorySlug),
          eq(articles.status, "published"),
        ),
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    return rows.map((row) => toFeedArticle(row as FeedRow));
  }, []);
}

export const getCategoryFeed = unstable_cache(
  (categorySlug: string) => getArticlesByCategory(categorySlug, 30),
  ["category-feed"],
  { revalidate: 1800, tags: ["articles", "categories"] },
);

export async function getRelatedArticles(
  categorySlug: string,
  articleId: number,
  limit = 3,
) {
  return await withFallback(async () => {
    const rows = await db
      .select(feedFields)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug))
      .orderBy(desc(articles.publishedAt))
      .limit(limit + 1);

    return rows
      .filter((row) => row.id !== articleId)
      .slice(0, limit)
      .map((row) => toFeedArticle(row as FeedRow));
  }, []);
}

export async function searchArticles(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    return await getLatestArticles(12);
  }

  return await withFallback(async () => {
    const pattern = `%${normalized}%`;
    const rows = await db
      .select(feedFields)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        or(
          ilike(articles.titleEn, pattern),
          ilike(articles.titleNe, pattern),
          ilike(articles.excerptEn, pattern),
          ilike(articles.excerptNe, pattern),
        ),
      )
      .orderBy(desc(articles.publishedAt))
      .limit(12);

    return rows.map((row) => toFeedArticle(row as FeedRow));
  }, []);
}
