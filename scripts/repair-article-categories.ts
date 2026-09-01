import { config } from "dotenv";
import { eq, isNull } from "drizzle-orm";
import { closeDatabase, db } from "../lib/db";
import { articles, categories } from "../lib/db/schema";
import { inferCategoryIdFromText } from "../lib/category-inference";

config({ path: ".env.local" });

async function main() {
  const categoryRows = await db.select().from(categories);
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));
  const uncategorized = await db
    .select()
    .from(articles)
    .where(isNull(articles.categoryId));

  for (const article of uncategorized) {
    const categoryId = inferCategoryIdFromText(
      article.titleEn,
      `${article.excerptEn} ${article.sourceHeadline}`,
      categoryRows.map((row) => ({ id: row.id, slug: row.slug })),
      "politics",
    );

    if (!categoryId) continue;

    await db
      .update(articles)
      .set({ categoryId })
      .where(eq(articles.id, article.id));

    const categorySlug =
      categoryRows.find((row) => row.id === categoryId)?.slug ?? "politics";
    console.log(`Categorized article ${article.id} as ${categorySlug}`);
  }
}

main()
  .catch((error) => {
    console.error("Article category repair failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
