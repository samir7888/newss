import type { MetadataRoute } from "next";
import { categories } from "@/lib/site";
import { config } from "dotenv";
config({ path: ".env.local" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://nepalisamachar.xyz";
const origin = siteUrl.replace(/\/$/, "");

export const revalidate = 3600; // Revalidate every hour - static content doesn't change often

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only handle static routes and categories - articles are handled by sitemap-articles.xml

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${origin}`,
      changeFrequency: "hourly" as const,
      priority: 1.0,
      alternates: {
        languages: {
          ne: `${origin}`,
          en: `${origin}/en`,
        },
      },
    },
    {
      url: `${origin}/en`,
      changeFrequency: "hourly" as const,
      priority: 1.0,
      alternates: {
        languages: {
          ne: `${origin}`,
          en: `${origin}/en`,
        },
      },
    },
    {
      url: `${origin}/ne/search`,
      changeFrequency: "daily" as const,
      priority: 0.7,
      alternates: {
        languages: {
          ne: `${origin}/ne/search`,
          en: `${origin}/en/search`,
        },
      },
    },
    {
      url: `${origin}/en/search`,
      changeFrequency: "daily" as const,
      priority: 0.7,
      alternates: {
        languages: {
          ne: `${origin}/ne/search`,
          en: `${origin}/en/search`,
        },
      },
    },
    {
      url: `${origin}/ne/saved`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      alternates: {
        languages: {
          ne: `${origin}/ne/saved`,
          en: `${origin}/en/saved`,
        },
      },
    },
    {
      url: `${origin}/en/saved`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      alternates: {
        languages: {
          ne: `${origin}/ne/saved`,
          en: `${origin}/en/saved`,
        },
      },
    },
    {
      url: `${origin}/ne/about`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          ne: `${origin}/ne/about`,
          en: `${origin}/en/about`,
        },
      },
    },
    {
      url: `${origin}/en/about`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          ne: `${origin}/ne/about`,
          en: `${origin}/en/about`,
        },
      },
    },
    {
      url: `${origin}/ne/contact`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          ne: `${origin}/ne/contact`,
          en: `${origin}/en/contact`,
        },
      },
    },
    {
      url: `${origin}/en/contact`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          ne: `${origin}/ne/contact`,
          en: `${origin}/en/contact`,
        },
      },
    },
    {
      url: `${origin}/ne/privacy-policy`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          ne: `${origin}/ne/privacy-policy`,
          en: `${origin}/en/privacy-policy`,
        },
      },
    },
    {
      url: `${origin}/en/privacy-policy`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          ne: `${origin}/ne/privacy-policy`,
          en: `${origin}/en/privacy-policy`,
        },
      },
    },
    {
      url: `${origin}/ne/terms`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          ne: `${origin}/ne/terms`,
          en: `${origin}/en/terms`,
        },
      },
    },
    {
      url: `${origin}/en/terms`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          ne: `${origin}/ne/terms`,
          en: `${origin}/en/terms`,
        },
      },
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${origin}/ne/category/${cat.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          ne: `${origin}/ne/category/${cat.slug}`,
          en: `${origin}/en/category/${cat.slug}`,
        },
      },
    },
    {
      url: `${origin}/en/category/${cat.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          ne: `${origin}/ne/category/${cat.slug}`,
          en: `${origin}/en/category/${cat.slug}`,
        },
      },
    },
  ]);

  return [...staticRoutes, ...categoryRoutes];
}
