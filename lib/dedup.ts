import crypto from "node:crypto";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "between",
  "by",
  "for",
  "from",
  "government",
  "has",
  "in",
  "into",
  "is",
  "it",
  "new",
  "of",
  "on",
  "or",
  "plan",
  "strategy",
  "the",
  "their",
  "to",
  "travel",
  "with",
  "was",
  "were",
  "will",
]);

export function normalizeHeadline(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toMeaningfulTokens(value: string) {
  return normalizeHeadline(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function toBigrams(tokens: string[]) {
  const bigrams = new Set<string>();
  for (let index = 0; index < tokens.length - 1; index += 1) {
    bigrams.add(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return bigrams;
}

export function contentHash(headline: string) {
  return crypto
    .createHash("sha256")
    .update(normalizeHeadline(headline))
    .digest("hex");
}

export function titleSimilarity(a: string, b: string) {
  const leftTokens = toMeaningfulTokens(a);
  const rightTokens = toMeaningfulTokens(b);

  if (!leftTokens.length || !rightTokens.length) return 0;

  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);
  const overlap = [...leftSet].filter((word) => rightSet.has(word)).length;
  const union = new Set([...leftSet, ...rightSet]).size;
  const jaccard = union === 0 ? 0 : overlap / union;

  const leftBigrams = toBigrams(leftTokens);
  const rightBigrams = toBigrams(rightTokens);
  const bigramOverlap = [...leftBigrams].filter((phrase) =>
    rightBigrams.has(phrase),
  ).length;
  const bigramUnion = new Set([...leftBigrams, ...rightBigrams]).size;
  const bigramScore = bigramUnion === 0 ? 0 : bigramOverlap / bigramUnion;

  return Math.max(jaccard, bigramScore);
}

export function isDuplicateCandidate(
  candidateTitle: string,
  existingTitles: string[],
) {
  const candidateHash = contentHash(candidateTitle);
  const hashes = existingTitles.map((title) => contentHash(title));

  if (hashes.includes(candidateHash)) return true;

  return existingTitles.some(
    (title) => titleSimilarity(candidateTitle, title) > 0.3,
  );
}
