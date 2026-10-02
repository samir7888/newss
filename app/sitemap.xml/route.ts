import { NextResponse } from "next/server";
import { categories } from "@/lib/site";
import { getAllArticleSlugs } from "@/lib/news-data";

export const revalidate = 86400; // Revalidate once per day since articles are static

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://nepalisamachar.xyz";
  const origin = siteUrl.replace(/\/$/, "");

  const staticRoutes = [
    {
      url: `${origin}`,
      changeFrequency: "hourly",
      priority: "1.0",
    },
    {
      url: `${origin}/en`,
      changeFrequency: "hourly",
      priority: "1.0",
    },
    {
      url: `${origin}/ne/search`,
      changeFrequency: "daily",
      priority: "0.7",
    },
    {
      url: `${origin}/en/search`,
      changeFrequency: "daily",
      priority: "0.7",
    },
    {
      url: `${origin}/ne/saved`,
      changeFrequency: "weekly",
      priority: "0.5",
    },
    {
      url: `${origin}/en/saved`,
      changeFrequency: "weekly",
      priority: "0.5",
    },
    {
      url: `${origin}/ne/about`,
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/en/about`,
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/ne/contact`,
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/en/contact`,
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/ne/privacy-policy`,
      changeFrequency: "monthly",
      priority: "0.3",
    },
    {
      url: `${origin}/en/privacy-policy`,
      changeFrequency: "monthly",
      priority: "0.3",
    },
    {
      url: `${origin}/ne/terms`,
      changeFrequency: "monthly",
      priority: "0.3",
    },
    {
      url: `${origin}/en/terms`,
      changeFrequency: "monthly",
      priority: "0.3",
    },
  ];

  const categoryRoutes = categories.flatMap((cat) => [
    {
      url: `${origin}/ne/category/${cat.slug}`,
      changeFrequency: "hourly",
      priority: "0.9",
    },
    {
      url: `${origin}/en/category/${cat.slug}`,
      changeFrequency: "hourly",
      priority: "0.9",
    },
  ]);

  // Get all articles since they're static and don't change
  const articleSlugs = await getAllArticleSlugs(24_000);
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

  const allUrls = [...staticRoutes, ...categoryRoutes, ...articleRoutes];

  const urls = allUrls
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
