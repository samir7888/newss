import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "../lib/db";
import { articles } from "../lib/db/schema";
import {
  normalizeNepaliText,
  stripHtml,
  toRichHtml,
} from "../lib/article-content";
import {
  hasDevanagari,
  isInvalidTranslationText,
  makeSlug,
  translateSingle,
  translateParagraphList,
} from "./fetch-news";

config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set; skipping existing article translation.");
    return;
  }

  const rows = await db.select().from(articles);
  console.log(`Found ${rows.length} articles to check and repair...`);

  let repairedCount = 0;

  for (const article of rows) {
    try {
      const rawBodyEnText = stripHtml(article.bodyEn);
      const rawBodyNeText = stripHtml(article.bodyNe);

      const enIsCorrupted =
        isInvalidTranslationText(article.titleEn) ||
        isInvalidTranslationText(article.excerptEn) ||
        isInvalidTranslationText(rawBodyEnText) ||
        article.slugEn.toLowerCase().includes("invalid-source-language") ||
        article.slugEn.toLowerCase().includes("auto-is-an-invalid") ||
        article.titleEn.toLowerCase().includes("invalid source language");

      const enHasNepali =
        hasDevanagari(rawBodyEnText) || hasDevanagari(article.titleEn);
      const neHasNepali =
        hasDevanagari(rawBodyNeText) || hasDevanagari(article.titleNe);

      let titleEn = article.titleEn;
      let titleNe = article.titleNe;
      let excerptEn = article.excerptEn;
      let excerptNe = article.excerptNe;
      let bodyEnText = rawBodyEnText;
      let bodyNeText = rawBodyNeText;

      let needsUpdate = false;

      if (enIsCorrupted) {
        console.log(`Repairing corrupted English translation for article ID ${article.id}...`);
        needsUpdate = true;

        // Use valid Nepali content as ground truth
        const nepaliSourceTitle = hasDevanagari(article.titleNe)
          ? article.titleNe
          : article.sourceHeadline;
        const nepaliSourceExcerpt = hasDevanagari(article.excerptNe)
          ? article.excerptNe
          : nepaliSourceTitle;
        const nepaliSourceBody = hasDevanagari(rawBodyNeText)
          ? rawBodyNeText
          : nepaliSourceTitle;

        titleNe = nepaliSourceTitle;
        excerptNe = nepaliSourceExcerpt;
        bodyNeText = nepaliSourceBody;

        titleEn = await translateSingle(nepaliSourceTitle, "en");
        excerptEn = await translateSingle(nepaliSourceExcerpt, "en");

        const nepaliParagraphs = nepaliSourceBody
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0 && !isInvalidTranslationText(p));

        const translatedEnParagraphs = await translateParagraphList(
          nepaliParagraphs,
          "en",
        );
        bodyEnText = translatedEnParagraphs
          .filter((p) => !isInvalidTranslationText(p))
          .join("\n\n");
      } else if (enHasNepali && neHasNepali) {
        // bodyEn mistakenly contains Nepali text
        needsUpdate = true;
        const nepaliSourceBody = hasDevanagari(rawBodyNeText)
          ? rawBodyNeText
          : rawBodyEnText;
        const nepaliSourceTitle = hasDevanagari(article.titleNe)
          ? article.titleNe
          : article.titleEn;
        const nepaliSourceExcerpt = hasDevanagari(article.excerptNe)
          ? article.excerptNe
          : article.excerptEn;

        titleNe = nepaliSourceTitle;
        excerptNe = nepaliSourceExcerpt;
        bodyNeText = nepaliSourceBody;

        titleEn = await translateSingle(nepaliSourceTitle, "en");
        excerptEn = await translateSingle(nepaliSourceExcerpt, "en");
        const nepaliParagraphs = nepaliSourceBody
          .split(/\n\s*\n/)
          .filter(Boolean);
        const translatedEnParagraphs = await translateParagraphList(
          nepaliParagraphs,
          "en",
        );
        bodyEnText = translatedEnParagraphs.join("\n\n");
      } else if (!enHasNepali && !neHasNepali) {
        // bodyNe is missing Nepali text (is English)
        needsUpdate = true;
        titleEn = article.titleEn;
        excerptEn = article.excerptEn;
        bodyEnText = rawBodyEnText;

        titleNe = await translateSingle(article.titleEn, "ne");
        excerptNe = await translateSingle(article.excerptEn, "ne");
        const englishParagraphs = rawBodyEnText
          .split(/\n\s*\n/)
          .filter(Boolean);
        const translatedNeParagraphs = await translateParagraphList(
          englishParagraphs,
          "ne",
        );
        bodyNeText = translatedNeParagraphs.join("\n\n");
      } else if (enHasNepali && !neHasNepali) {
        // Fields swapped
        needsUpdate = true;
        titleEn = await translateSingle(article.titleEn, "en");
        titleNe = article.titleEn;
        excerptEn = await translateSingle(article.excerptEn, "en");
        excerptNe = article.excerptEn;
        const nepaliParagraphs = rawBodyEnText.split(/\n\s*\n/).filter(Boolean);
        const translatedEnParagraphs = await translateParagraphList(
          nepaliParagraphs,
          "en",
        );
        bodyEnText = translatedEnParagraphs.join("\n\n");
        bodyNeText = rawBodyEnText;
      }

      // Check if slugs are corrupted
      let newSlugEn = article.slugEn;
      if (
        isInvalidTranslationText(article.slugEn) ||
        article.slugEn.toLowerCase().includes("invalid-source-language") ||
        article.slugEn.toLowerCase().includes("auto-is-an-invalid")
      ) {
        needsUpdate = true;
        const cleanSlugSeed = !isInvalidTranslationText(titleEn)
          ? titleEn
          : "nepal-news";
        newSlugEn = `${makeSlug(cleanSlugSeed)}-en-${article.id}`;
      }

      let newSlugNe = article.slugNe;
      if (
        isInvalidTranslationText(article.slugNe) ||
        article.slugNe.toLowerCase().includes("invalid-source-language") ||
        article.slugNe.toLowerCase().includes("auto-is-an-invalid")
      ) {
        needsUpdate = true;
        const cleanSlugSeed = !isInvalidTranslationText(titleNe)
          ? titleNe
          : "nepal-news";
        newSlugNe = `${makeSlug(cleanSlugSeed)}-ne-${article.id}`;
      }

      // Ensure fallback titles/excerpts are clean
      if (isInvalidTranslationText(titleEn) || hasDevanagari(titleEn)) {
        titleEn = "Nepal News: Update";
      }
      if (isInvalidTranslationText(excerptEn) || hasDevanagari(excerptEn)) {
        excerptEn = "Latest reporting and verified developments from Nepal.";
      }

      // Re-render rich HTML
      const bodyEnHtml = toRichHtml(bodyEnText, "en");
      const bodyNeHtml = toRichHtml(normalizeNepaliText(bodyNeText), "ne");

      const updateData: Record<string, any> = {
        titleEn,
        titleNe,
        excerptEn,
        excerptNe,
        bodyEn: bodyEnHtml,
        bodyNe: bodyNeHtml,
        metaDescriptionEn: excerptEn.slice(0, 155),
        metaDescriptionNe: excerptNe.slice(0, 150),
        slugEn: newSlugEn,
        slugNe: newSlugNe,
      };

      if (
        isInvalidTranslationText(article.imageAlt) ||
        article.imageAlt.toLowerCase().includes("invalid source language")
      ) {
        updateData.imageAlt = `${titleEn || titleNe} image`;
      }

      await db
        .update(articles)
        .set(updateData)
        .where(eq(articles.id, article.id));

      repairedCount++;
      console.log(`✓ Repaired article ${article.id}: "${titleEn}" / "${titleNe}"`);
      console.log(`  SlugEn: ${newSlugEn}`);
    } catch (error) {
      console.warn(
        `Skipping article ${article.id}: ${(error as Error).message}`,
      );
    }
  }
  console.log(`Finished repairing articles. Total processed: ${repairedCount}`);
}

main()
  .catch((error) => {
    console.error("Existing article repair failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
