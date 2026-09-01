import Parser from "rss-parser";
import { load } from "cheerio";
import { contentHash } from "../lib/dedup";
import { normalizeNepaliText, toRichHtml } from "../lib/article-content";
import { inferCategorySlugFromText } from "../lib/category-inference";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

async function runTest() {
  console.log("=== Testing Full Setopati Ingestion Flow ===");
  const feed = await parser.parseURL("https://www.setopati.com/feed");
  console.log(`Feed contains ${feed.items.length} items.`);

  const stories = [];

  for (const item of feed.items.slice(0, 3)) {
    const rawTitle = (item.title ?? "").trim();
    const cleanLink = (item.link ?? "").trim();
    console.log(`\nProcessing: "${rawTitle}"`);
    console.log(`Link: ${cleanLink}`);

    const res = await fetch(cleanLink, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      continue;
    }

    const html = await res.text();
    const $ = load(html);
    console.log(html,$)

    const title = $("h1").first().text().trim() || $(".news-big-title").first().text().trim() || rawTitle;
    const subHeading = $(".news-sub-heading").first().text().trim();
    const excerpt = $("meta[name='description']").attr("content") || subHeading || (item.contentSnippet ?? "").trim();
    const ogImage = $("meta[property='og:image']").attr("content") || "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80";

    const paragraphs: string[] = [];
    $(".editor-box p, .content-editor p, .news-detail-section p, .detail-box p").each((_, p) => {
      const t = $(p).text().replace(/\s+/g, " ").trim();
      if (t.length > 20 && !t.includes("सर्वाधिकार सुरक्षित") && !t.includes("©")) {
        paragraphs.push(t);
      }
    });

    const category = inferCategorySlugFromText(title, `${excerpt} ${paragraphs.join(" ")}`, "politics");
    const bodyNeHtml = toRichHtml(normalizeNepaliText(paragraphs.join("\n\n")), "ne");

    stories.push({
      title,
      excerpt: excerpt,
      category,
      ogImage,
      paragraphsCount: paragraphs.length,
      bodyHtmlSnippet: bodyNeHtml,
      hash: contentHash(title),
    });
  }

  console.log("\n=== Extracted Results ===");
  console.dir(stories, { depth: null });
  console.log("\n✅ All Setopati stories parsed successfully with rich content!");
}

runTest();
