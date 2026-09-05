import type { MetadataRoute } from "next";
import { getLatestArticles } from "@/lib/news-data";
import { categories } from "@/lib/site";
import { config } from "dotenv";
config({ path: ".env.local" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";
const origin = siteUrl.replace(/\/$/, "");

export const revalidate = 60; // Revalidate sitemap every 1 minute

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getLatestArticles(200);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}`, changeFrequency: "hourly" as const, priority: 1.0 },
    { url: `${origin}/en`, changeFrequency: "hourly" as const, priority: 1.0 },
    { url: `${origin}/ne/search`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${origin}/en/search`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${origin}/ne/saved`, changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${origin}/en/saved`, changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${origin}/ne/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${origin}/en/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${origin}/ne/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${origin}/en/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${origin}/ne/privacy-policy`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${origin}/en/privacy-policy`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${origin}/ne/terms`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${origin}/en/terms`, changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${origin}/ne/category/${cat.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${origin}/en/category/${cat.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
  ]);

  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((article) => [
    {
      url: `${origin}/ne/article/${article.slugNe}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${origin}/en/article/${article.slugEn}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ]);

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
