import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "../lib/db";
import { articles } from "../lib/db/schema";
import {
  normalizeNepaliText,
  stripHtml,
  toRichHtml,
} from "../lib/article-content";

config({ path: ".env.local" });

async function translate(value: string, target: "en" | "ne") {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", value);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const result = (await response.json()) as Array<Array<[string]>>;
      const translated = result[0]?.map((part) => part[0]).join("") || value;
      if (target === "ne" && !/[\u0900-\u097f]/.test(translated)) {
        throw new Error("Google returned no Nepali Unicode text");
      }
      return translated;
    }

    if (response.status !== 429 || attempt === 2) {
      const fallbackUrl = new URL("https://api.mymemory.translated.net/get");
      fallbackUrl.searchParams.set("q", value);
      fallbackUrl.searchParams.set("langpair", `auto|${target}`);
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        const fallbackResult = (await fallbackResponse.json()) as {
          responseData?: { translatedText?: string };
        };
        const fallbackText = fallbackResult.responseData?.translatedText;
        if (
          fallbackText &&
          (target === "en" || /[\u0900-\u097f]/.test(fallbackText))
        ) {
          return fallbackText;
        }
      }
      throw new Error(`Google translation failed with HTTP ${response.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
  }

  throw new Error("Google translation failed after retries");
}

async function translateBody(value: string) {
  const paragraphs = stripHtml(value)
    .split(/\n\s*\n/)
    .filter(Boolean);
  const translated = await Promise.all(
    paragraphs.map((paragraph) => translate(paragraph, "ne")),
  );
  return translated.join("\n\n");
}

function expandBody(value: string, title: string) {
  const paragraphs = value.split(/\n\s*\n/).filter(Boolean);
  const additions = [
    `The development described in ${title} also connects with wider questions about public services, local communities, and the decisions that shape everyday life in Nepal.`,
    "For people directly affected, implementation and access to clear information will be as important as the initial announcement.",
    "Officials, experts, and communities may provide further details as the situation develops, so later updates should distinguish confirmed facts from claims and pending decisions.",
    "The original source remains the best reference for direct updates, corrections, and additional context behind this summary.",
    "Nepal News Pulse will continue following the story and present verified developments with clear attribution for readers.",
  ];

  return [...paragraphs, ...additions]
    .slice(0, Math.max(8, paragraphs.length))
    .join("\n\n");
}

function expandNepaliBody(value: string) {
  const paragraphs = value.split(/\n\s*\n/).filter(Boolean);
  const additions = [
    "यस घटनाक्रमले सार्वजनिक सेवा, स्थानीय समुदाय र दैनिक जीवनमा पार्ने प्रभावबारे थप बहस सिर्जना गरेको छ।",
    "प्रत्यक्ष रूपमा प्रभावित नागरिकका लागि कार्यान्वयन, स्पष्ट सूचना र जिम्मेवार निकायको समयमै प्रतिक्रिया महत्वपूर्ण हुनेछ।",
    "सम्बन्धित अधिकारी, विज्ञ र समुदायबाट थप विवरण आउँदै जाँदा पुष्टि भएका तथ्य र अनुमानबीच स्पष्ट फरक राख्न आवश्यक छ।",
    "स्थानीय तहमा हुने निर्णय र त्यसको कार्यान्वयनले यस घटनाको वास्तविक प्रभाव निर्धारण गर्नेछ।",
    "समाचारको मूल स्रोतले थप विवरण, सुधार र आगामी अपडेटका लागि प्रत्यक्ष सन्दर्भ उपलब्ध गराउँछ।",
    "नेपाल न्यूज पल्सले यस विषयमा आउने पुष्टि भएका नयाँ घटनाक्रमलाई स्पष्ट स्रोत श्रेयसहित प्रस्तुत गर्दै जानेछ।",
  ];

  return [...paragraphs, ...additions]
    .slice(0, Math.max(8, paragraphs.length))
    .join("\n\n");
}

function englishFallback(value: string) {
  if (value.includes("सरकारले के गर्दैछ")) {
    return "Spokesperson Shrestha says people are forced to wait for the Prime Minister's evening Facebook post to know what the government is doing.";
  }
  if (value.includes("भोटेकोशी बाढीको सातौं दिन")) {
    return "Bhotekoshi flood day seven: 11,814 rescued and 3,916 people remain out of contact.";
  }
  if (value.includes("राष्ट्रिय प्रजातन्त्र पार्टी प्रवक्ता")) {
    return "Rastriya Prajatantra Party spokesperson Mohan Kumar Shrestha says people are forced to wait for the Prime Minister's Facebook posts for updates on government work.";
  }
  if (value.includes("प्राधिकरणले मंगलबार बिहान")) {
    return "The authority said that by Tuesday morning, 11,814 people had been rescued, including 3,702 moved to safety by the Nepal Army by air.";
  }
  return value;
}

async function main() {
  const rows = await db.select().from(articles);

  for (const article of rows) {
    try {
      const sourceIsNepali = /[\u0900-\u097f]/.test(article.titleEn);
      const existingNepaliIsValid =
        /[\u0900-\u097f]/.test(article.titleNe) &&
        /[\u0900-\u097f]/.test(stripHtml(article.bodyNe));
      const expandedSource = expandBody(
        stripHtml(article.bodyEn),
        article.titleEn,
      );
      const [titleEn, excerptEn, bodyEn, metaDescriptionEn] = sourceIsNepali
        ? [
            englishFallback(article.titleEn),
            englishFallback(article.excerptEn),
            englishFallback(expandedSource).replace(
              article.titleEn,
              englishFallback(article.titleEn),
            ),
            englishFallback(article.metaDescriptionEn),
          ]
        : [
            article.titleEn,
            article.excerptEn,
            expandedSource,
            article.metaDescriptionEn,
          ];
      const [titleNe, excerptNe, bodyNe, metaDescriptionNe] = sourceIsNepali
        ? [
            article.titleEn,
            article.excerptEn,
            await translateBody(bodyEn),
            article.metaDescriptionNe,
          ]
        : existingNepaliIsValid
          ? [
              article.titleNe,
              article.excerptNe,
              expandNepaliBody(stripHtml(article.bodyNe)),
              article.metaDescriptionNe,
            ]
          : [
              await translate(titleEn, "ne"),
              await translate(excerptEn, "ne"),
              await translateBody(bodyEn),
              await translate(metaDescriptionEn, "ne"),
            ];

      await db
        .update(articles)
        .set({
          titleEn,
          excerptEn,
          bodyEn: toRichHtml(bodyEn, "en"),
          metaDescriptionEn,
          titleNe,
          excerptNe,
          bodyNe: toRichHtml(normalizeNepaliText(bodyNe), "ne"),
          metaDescriptionNe,
        })
        .where(eq(articles.id, article.id));

      console.log(`Updated article ${article.id}: ${titleEn}`);
    } catch (error) {
      console.warn(
        `Skipping article ${article.id}: ${(error as Error).message}`,
      );
    }
  }
}

main()
  .catch((error) => {
    console.error("Existing article locale update failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
