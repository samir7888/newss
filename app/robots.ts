import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/private/", "/admin/", "/*.pdf$", "/api/"],
        crawlDelay: 1,
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp"],
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: [
          "DuckDuckBot",
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Perplexity",
          "PerplexityBot",
          "YouBot",
          "Bytespider",
          "facebookexternalhit",
          "Twitterbot",
          "LinkedInBot",
          "AppleBot",
          "AppleBot-Extended",
        ],
        allow: "/",
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
