import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, categories } from "@/lib/db/schema";

// Google News sitemaps should update frequently — news articles have a 48-hour crawl window
export const revalidate = 900; // 15 minutes

export async function GET() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://nepalisamachar.xyz"
  ).replace(/\/$/, "");

  // Google News only indexes articles published in the last 48 hours
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  let recentArticles: Array<{
    slugEn: string;
    slugNe: string;
    titleEn: string;
    titleNe: string;
    publishedAt: Date | string | null;
    categorySlug: string | null;
  }> = [];

  try {
    recentArticles = await db
      .select({
        slugEn: articles.slugEn,
        slugNe: articles.slugNe,
        titleEn: articles.titleEn,
        titleNe: articles.titleNe,
        publishedAt: articles.publishedAt,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.status, "published"),
          gte(articles.publishedAt, cutoff),
        ),
      )
      .orderBy(desc(articles.publishedAt))
      .limit(1000);
  } catch {
    // Return an empty sitemap on DB error rather than a 500
    recentArticles = [];
  }

  const urlEntries = recentArticles
    .flatMap((article) => {
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : new Date().toISOString();

      return [
        // Nepali version
        `  <url>
    <loc>${siteUrl}/ne/article/${article.slugNe}</loc>
    <lastmod>${pubDate}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Nepali Samachar</news:name>
        <news:language>ne</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.titleNe || article.titleEn}]]></news:title>
    </news:news>
  </url>`,
        // English version
        `  <url>
    <loc>${siteUrl}/en/article/${article.slugEn}</loc>
    <lastmod>${pubDate}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Nepali Samachar</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.titleEn || article.titleNe}]]></news:title>
    </news:news>
  </url>`,
      ];
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=900, stale-while-revalidate=60",
    },
  });
}
