const CATEGORY_KEYWORDS: Record<
  string,
  Array<{ term: string; weight: number }>
> = {
  politics: [
    { term: "government", weight: 5 },
    { term: "minister", weight: 5 },
    { term: "parliament", weight: 5 },
    { term: "election", weight: 5 },
    { term: "policy", weight: 4 },
    { term: "cabinet", weight: 4 },
    { term: "party", weight: 4 },
    { term: "municipality", weight: 3 },
    { term: "municipal", weight: 3 },
    { term: "law", weight: 3 },
    { term: "court", weight: 3 },
    { term: "official", weight: 2 },
    { term: "government policy", weight: 5 },
    { term: "state", weight: 2 },
    { term: "administration", weight: 2 },
  ],
  economy: [
    { term: "budget", weight: 5 },
    { term: "market", weight: 5 },
    { term: "inflation", weight: 5 },
    { term: "bank", weight: 4 },
    { term: "trade", weight: 4 },
    { term: "business", weight: 4 },
    { term: "investment", weight: 4 },
    { term: "tax", weight: 4 },
    { term: "revenue", weight: 4 },
    { term: "economy", weight: 4 },
    { term: "industry", weight: 3 },
    { term: "finance", weight: 3 },
    { term: "currency", weight: 3 },
    { term: "startup", weight: 2 },
    { term: "enterprise", weight: 2 },
  ],
  technology: [
    { term: "ai", weight: 6 },
    { term: "artificial intelligence", weight: 6 },
    { term: "software", weight: 5 },
    { term: "startup", weight: 5 },
    { term: "digital", weight: 4 },
    { term: "technology", weight: 4 },
    { term: "tech", weight: 4 },
    { term: "cybersecurity", weight: 4 },
    { term: "platform", weight: 3 },
    { term: "mobile", weight: 3 },
    { term: "app", weight: 3 },
    { term: "internet", weight: 3 },
    { term: "data", weight: 2 },
    { term: "innovation", weight: 2 },
    { term: "smartphone", weight: 2 },
  ],
  culture: [
    { term: "festival", weight: 5 },
    { term: "heritage", weight: 5 },
    { term: "art", weight: 4 },
    { term: "music", weight: 4 },
    { term: "tourism", weight: 4 },
    { term: "tradition", weight: 4 },
    { term: "culture", weight: 4 },
    { term: "film", weight: 3 },
    { term: "dance", weight: 3 },
    { term: "poetry", weight: 3 },
    { term: "literature", weight: 3 },
    { term: "heritage site", weight: 4 },
    { term: "travel", weight: 2 },
    { term: "historical", weight: 2 },
  ],
  sports: [
    { term: "football", weight: 5 },
    { term: "cricket", weight: 5 },
    { term: "match", weight: 4 },
    { term: "league", weight: 4 },
    { term: "player", weight: 4 },
    { term: "tournament", weight: 4 },
    { term: "sport", weight: 4 },
    { term: "stadium", weight: 4 },
    { term: "coach", weight: 3 },
    { term: "athlete", weight: 3 },
    { term: "championship", weight: 3 },
    { term: "teams", weight: 2 },
    { term: "final", weight: 2 },
  ],
};

const VALID_CATEGORY_SLUGS = new Set(Object.keys(CATEGORY_KEYWORDS));

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function inferCategorySlugFromText(
  title: string,
  snippet: string = "",
  preferredCategorySlug?: string,
) {
  const source = `${title ?? ""} ${snippet ?? ""}`.toLowerCase();

  if (!source.trim()) {
    return preferredCategorySlug &&
      VALID_CATEGORY_SLUGS.has(preferredCategorySlug)
      ? preferredCategorySlug
      : "politics";
  }

  let bestCategory =
    preferredCategorySlug && VALID_CATEGORY_SLUGS.has(preferredCategorySlug)
      ? preferredCategorySlug
      : "politics";
  let bestScore = -1;

  for (const [category, terms] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;

    for (const { term, weight } of terms) {
      const normalizedTerm = term.toLowerCase();
      const regex = new RegExp(`\\b${escapeRegex(normalizedTerm)}\\b`, "i");

      if (regex.test(source)) {
        score += weight + 1;
      } else if (source.includes(normalizedTerm)) {
        score += Math.max(1, weight / 2);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  if (bestScore <= 0) {
    return preferredCategorySlug &&
      VALID_CATEGORY_SLUGS.has(preferredCategorySlug)
      ? preferredCategorySlug
      : "politics";
  }

  return bestCategory;
}

export function inferCategoryIdFromText(
  title: string,
  snippet: string,
  categoryRows: Array<{ id: number; slug: string }>,
  preferredCategorySlug?: string,
) {
  const categorySlug = inferCategorySlugFromText(
    title,
    snippet,
    preferredCategorySlug,
  );
  const match = categoryRows.find((row) => row.slug === categorySlug);
  return (
    match?.id ?? categoryRows.find((row) => row.slug === "politics")?.id ?? null
  );
}
