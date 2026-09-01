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

  for (const article of rows) {
    try {
      const rawBodyEnText = stripHtml(article.bodyEn);
      const rawBodyNeText = stripHtml(article.bodyNe);
      const enHasNepali = hasDevanagari(rawBodyEnText) || hasDevanagari(article.titleEn);
      const neHasNepali = hasDevanagari(rawBodyNeText) || hasDevanagari(article.titleNe);

      let titleEn = article.titleEn;
      let titleNe = article.titleNe;
      let excerptEn = article.excerptEn;
      let excerptNe = article.excerptNe;
      let bodyEnText = rawBodyEnText;
      let bodyNeText = rawBodyNeText;

      if (enHasNepali && neHasNepali) {
        // bodyEn mistakenly contains Nepali text!
        // Use the Nepali text as the true Nepali source, and translate to English
        const nepaliSourceBody = hasDevanagari(rawBodyNeText) ? rawBodyNeText : rawBodyEnText;
        const nepaliSourceTitle = hasDevanagari(article.titleNe) ? article.titleNe : article.titleEn;
        const nepaliSourceExcerpt = hasDevanagari(article.excerptNe) ? article.excerptNe : article.excerptEn;

        titleNe = nepaliSourceTitle;
        excerptNe = nepaliSourceExcerpt;
        bodyNeText = nepaliSourceBody;

        titleEn = await translateSingle(nepaliSourceTitle, "en");
        excerptEn = await translateSingle(nepaliSourceExcerpt, "en");
        const nepaliParagraphs = nepaliSourceBody.split(/\n\s*\n/).filter(Boolean);
        const translatedEnParagraphs = await translateParagraphList(nepaliParagraphs, "en");
        bodyEnText = translatedEnParagraphs.join("\n\n");
      } else if (!enHasNepali && !neHasNepali) {
        // bodyNe is missing Nepali text (is English)!
        titleEn = article.titleEn;
        excerptEn = article.excerptEn;
        bodyEnText = rawBodyEnText;

        titleNe = await translateSingle(article.titleEn, "ne");
        excerptNe = await translateSingle(article.excerptEn, "ne");
        const englishParagraphs = rawBodyEnText.split(/\n\s*\n/).filter(Boolean);
        const translatedNeParagraphs = await translateParagraphList(englishParagraphs, "ne");
        bodyNeText = translatedNeParagraphs.join("\n\n");
      } else if (enHasNepali && !neHasNepali) {
        // Fields might be swapped
        titleEn = await translateSingle(article.titleEn, "en");
        titleNe = article.titleEn;
        excerptEn = await translateSingle(article.excerptEn, "en");
        excerptNe = article.excerptEn;
        const nepaliParagraphs = rawBodyEnText.split(/\n\s*\n/).filter(Boolean);
        const translatedEnParagraphs = await translateParagraphList(nepaliParagraphs, "en");
        bodyEnText = translatedEnParagraphs.join("\n\n");
        bodyNeText = rawBodyEnText;
      }

      // Re-render both with the new expanded minimum length
      const bodyEnHtml = toRichHtml(bodyEnText, "en");
      const bodyNeHtml = toRichHtml(normalizeNepaliText(bodyNeText), "ne");

      await db
        .update(articles)
        .set({
          titleEn,
          titleNe,
          excerptEn,
          excerptNe,
          bodyEn: bodyEnHtml,
          bodyNe: bodyNeHtml,
          metaDescriptionEn: excerptEn.slice(0, 155),
          metaDescriptionNe: excerptNe.slice(0, 150),
        })
        .where(eq(articles.id, article.id));

      console.log(`✓ Repaired article ${article.id}: ${titleEn} / ${titleNe}`);
    } catch (error) {
      console.warn(
        `Skipping article ${article.id}: ${(error as Error).message}`,
      );
    }
  }
  console.log("Finished repairing existing articles.");
}

main()
  .catch((error) => {
    console.error("Existing article repair failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
