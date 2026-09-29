import { NextResponse } from "next/server";
import { getAllArticleSlugs } from "@/lib/news-data";

export const revalidate = 600; // Revalidate every 10 minutes - more aggressive for new content

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://nepalisamachar.xyz";
  const origin = siteUrl.replace(/\/$/, "");

  try {
    // Get more articles for better coverage
    const articleSlugs = await getAllArticleSlugs(2000);

    const urls = articleSlugs
      .flatMap((article) => [
        {
          url: `${origin}/ne/article/${article.slugNe}`,
          lastModified: new Date(
            article.publishedAt || new Date()
          ).toISOString(),
          changeFrequency: "daily",
          priority: "0.8",
        },
        {
          url: `${origin}/en/article/${article.slugEn}`,
          lastModified: new Date(
            article.publishedAt || new Date()
          ).toISOString(),
          changeFrequency: "daily",
          priority: "0.8",
        },
      ])
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
        "Cache-Control": "public, max-age=600", // 10 minutes cache
      },
    });
  } catch (error) {
    console.error("Error generating articles sitemap:", error);

    // Return minimal sitemap on error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(errorSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
