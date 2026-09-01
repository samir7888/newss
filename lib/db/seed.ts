import { db } from "./index";
import { categories, sources } from "./schema";

export async function seedDatabase() {
  await db
    .insert(categories)
    .values([
      { slug: "politics", nameEn: "Politics", nameNe: "राजनीति" },
      { slug: "economy", nameEn: "Economy", nameNe: "अर्थव्यवस्था" },
      { slug: "technology", nameEn: "Technology", nameNe: "प्रविधि" },
      { slug: "culture", nameEn: "Culture", nameNe: "संस्कृति" },
      { slug: "sports", nameEn: "Sports", nameNe: "खेल" },
    ])
    .onConflictDoNothing();

  await db
    .insert(sources)
    .values([
      {
        name: "Online Khabar",
        baseUrl: "https://www.onlinekhabar.com",
        feedUrl: "https://www.onlinekhabar.com/feed",
        type: "rss",
        isActive: true,
      },
      {
        name: "Setopati",
        baseUrl: "https://www.setopati.com",
        feedUrl: "https://www.setopati.com/feed",
        type: "rss",
        isActive: true,
      },
      {
        name: "Ratopati",
        baseUrl: "https://www.ratopati.com",
        feedUrl: "https://www.ratopati.com/feed",
        type: "rss",
        isActive: true,
      },
      {
        name: "Techmandu",
        baseUrl: "https://techmandu.com",
        feedUrl: "https://techmandu.com/feed/",
        type: "rss",
        isActive: true,
      },
      {
        name: "BBC Nepali",
        baseUrl: "https://www.bbc.com/nepali",
        feedUrl: "https://feeds.bbci.co.uk/nepali/rss.xml",
        type: "rss",
        isActive: true,
      },
    ])
    .onConflictDoNothing();
}
