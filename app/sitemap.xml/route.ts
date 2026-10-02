import { NextResponse } from "next/server";
import { getAllArticleSlugs } from "@/lib/news-data";

export const revalidate = 86400; // Revalidate once per day since articles are static

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://nepalisamachar.xyz";
  const origin = siteUrl.replace(/\/$/, "");

  // Keep this small while testing Google Search Console fetching.
  const articleSlugs = await getAllArticleSlugs(50);
  const articleRoutes = articleSlugs.flatMap((article) => [
    {
      url: `${origin}/ne/article/${article.slugNe}`,
      lastModified: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      changeFrequency: "never",
      priority: "0.8",
    },
    {
      url: `${origin}/en/article/${article.slugEn}`,
      lastModified: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      changeFrequency: "never",
      priority: "0.8",
    },
  ]);

  const urls = articleRoutes
    .map((item) => {
      const lastModified =
        "lastModified" in item && item.lastModified
          ? `\n    <lastmod>${item.lastModified}</lastmod>`
          : "";

      return `  <url>
    <loc>${item.url}</loc>${lastModified}
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400", // 24 hour cache
    },
  });
}
