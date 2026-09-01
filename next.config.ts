import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.setopati.com" },
      { protocol: "https", hostname: "setopati.com" },
      { protocol: "https", hostname: "**.onlinekhabar.com" },
      { protocol: "https", hostname: "onlinekhabar.com" },
      { protocol: "https", hostname: "**.ratopati.com" },
      { protocol: "https", hostname: "ratopati.com" },
      { protocol: "https", hostname: "npcdn.ratopati.com" },
      { protocol: "https", hostname: "**.nepalitimes.com" },
      { protocol: "https", hostname: "nepalitimes.com" },
      { protocol: "https", hostname: "**.thehimalayantimes.com" },
      { protocol: "https", hostname: "thehimalayantimes.com" },
      { protocol: "https", hostname: "**.kathmandutribune.com" },
      { protocol: "https", hostname: "kathmandutribune.com" },
      { protocol: "https", hostname: "**.nagariknetwork.com" },
      { protocol: "https", hostname: "nagariknews.nagariknetwork.com" },
      { protocol: "https", hostname: "images.nagariknewscdn.com" },
      { protocol: "https", hostname: "**.techmandu.com" },
      { protocol: "https", hostname: "techmandu.com" },
      { protocol: "https", hostname: "**.bbci.co.uk" },
      { protocol: "https", hostname: "feeds.bbci.co.uk" },
      { protocol: "https", hostname: "**.rajdhanidaily.com" },
      { protocol: "https", hostname: "rajdhanidaily.com" },
      { protocol: "https", hostname: "**.newsofnepal.com" },
      { protocol: "https", hostname: "newsofnepal.com" },
      { protocol: "https", hostname: "**.telegraphnepal.com" },
      { protocol: "https", hostname: "arthasarokar.com" },
      { protocol: "https", hostname: "**.arthasarokar.com" },
    ],
  },
};

export default nextConfig;
