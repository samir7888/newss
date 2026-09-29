import { NextResponse } from "next/server";
import { categories } from "@/lib/site";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://nepalisamachar.xyz";
  const origin = siteUrl.replace(/\/$/, "");

  const staticRoutes = [
    {
      url: `${origin}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "hourly",
      priority: "1.0",
    },
    {
      url: `${origin}/en`,
      lastModified: new Date().toISOString(),
      changeFrequency: "hourly",
      priority: "1.0",
    },
    {
      url: `${origin}/ne/search`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: "0.7",
    },
    {
      url: `${origin}/en/search`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: "0.7",
    },
    {
      url: `${origin}/ne/saved`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: "0.5",
    },
    {
      url: `${origin}/en/saved`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: "0.5",
    },
    {
      url: `${origin}/ne/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/en/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/ne/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/en/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.6",
    },
    {
      url: `${origin}/ne/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.3",
    },
    {
      url: `${origin}/en/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.3",
    },
    {
      url: `${origin}/ne/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.3",
    },
    {
      url: `${origin}/en/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.3",
    },
  ];

  const categoryRoutes = categories.flatMap((cat) => [
    {
      url: `${origin}/ne/category/${cat.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "hourly",
      priority: "0.9",
    },
    {
      url: `${origin}/en/category/${cat.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "hourly",
      priority: "0.9",
    },
  ]);

  const allUrls = [...staticRoutes, ...categoryRoutes];

  const urls = allUrls
    .map(
      (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600", // 1 hour cache
    },
  });
}
