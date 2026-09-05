import { config } from "dotenv";
config({ path: ".env.local" });

import { desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { articles, categories } from "../lib/db/schema";
import { checkImageQuality } from "../lib/images/check-image-quality";
import {
  fetchStockImage,
  extractSearchKeywords,
} from "../lib/images/fetch-stock-image";

interface CheckImagesOptions {
  limit?: number;
  dryRun?: boolean;
}

export async function checkPublishedImages(options: CheckImagesOptions = {}) {
  const limit = options.limit ?? 50;
  const dryRun = options.dryRun ?? false;

  console.log(`[Image Audit] Checking latest ${limit} published articles...`);

  const rows = await db
    .select({
      id: articles.id,
      titleEn: articles.titleEn,
      titleNe: articles.titleNe,
      imageUrl: articles.imageUrl,
      categorySlug: categories.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  if (rows.length === 0) {
    console.log("[Image Audit] No articles found in database.");
    return { checked: 0, healthy: 0, repaired: 0, failed: 0 };
  }

  let healthyCount = 0;
  let repairedCount = 0;
  let failedCount = 0;

  for (const article of rows) {
    const title = article.titleEn || article.titleNe || `Article #${article.id}`;
    const url = article.imageUrl;

    if (!url) {
      console.warn(`[Image Audit: MISSING] Article #${article.id} ("${title}") has no image URL.`);
    } else {
      const quality = await checkImageQuality(url);
      if (quality.isUsable) {
        healthyCount++;
        continue;
      }
      console.warn(
        `[Image Audit: BROKEN] Article #${article.id} image failed check (${quality.reason}): ${url}`,
      );
    }

    // Re-run fallback logic to repair image
    try {
      const category = article.categorySlug || "general";
      const keywords = extractSearchKeywords(
        article.titleEn || article.titleNe,
        category,
      );
      const stock = await fetchStockImage(keywords, category);

      if (stock && stock.imageUrl) {
        if (!dryRun) {
          await db
            .update(articles)
            .set({
              imageUrl: stock.imageUrl,
              imageAlt: stock.imageAlt || `${title} image`,
              imageCredit: stock.imageCredit,
              imageCreditUrl: stock.imageCreditUrl,
            })
            .where(eq(articles.id, article.id));
          console.log(
            `[Image Audit: REPAIRED] Article #${article.id} updated with stock image: ${stock.imageUrl}`,
          );
        } else {
          console.log(
            `[Image Audit: DRY-RUN] Would repair article #${article.id} with stock image: ${stock.imageUrl}`,
          );
        }
        repairedCount++;
      } else {
        console.error(
          `[Image Audit: FAILED] Could not fetch fallback stock image for article #${article.id}`,
        );
        failedCount++;
      }
    } catch (err) {
      console.error(
        `[Image Audit: ERROR] Failed to repair article #${article.id}:`,
        (err as Error).message,
      );
      failedCount++;
    }
  }

  console.log(
    `\n================ Published Image Audit Summary ================\n` +
      `Total checked: ${rows.length}\n` +
      `Healthy images: ${healthyCount}\n` +
      `Repaired images: ${repairedCount}\n` +
      `Failed repairs: ${failedCount}\n` +
      `Dry run mode: ${dryRun ? "YES" : "NO"}\n` +
      `===============================================================\n`,
  );

  return {
    checked: rows.length,
    healthy: healthyCount,
    repaired: repairedCount,
    failed: failedCount,
  };
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("check-published-images.ts") ||
    process.argv[1].endsWith("check-published-images.js"));

if (isDirectRun) {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 30;
  const dryRun = process.argv.includes("--dry-run");

  checkPublishedImages({ limit, dryRun })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Image audit script encountered an unhandled error:", err);
      process.exit(1);
    });
}
