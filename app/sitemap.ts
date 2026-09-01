import type { MetadataRoute } from "next";
import { getLatestArticles } from "@/lib/news-data";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";
const origin = siteUrl.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getLatestArticles(200);

  return [
    { url: `${origin}/ne`, changeFrequency: "hourly" as const, priority: 1 },
    { url: `${origin}/en`, changeFrequency: "hourly" as const, priority: 1 },
    ...articles.flatMap((article) => [
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
    ]),
  ];
}
