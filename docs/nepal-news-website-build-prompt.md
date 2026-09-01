# Build Prompt: Nepal Trending News Aggregator (Bilingual, Ad-Monetized, Auto-Publishing)

Copy everything below into Claude Code (or another coding agent) as the project brief.

---

## 1. Project Summary

Build a production-grade, ad-monetized news/blog website focused on **trending news in Nepal**, fully bilingual (**English + Nepali**), that **automatically ingests news every 2 hours**, rewrites it into original articles (no duplicate/plagiarized content), attaches relevant images, and publishes it with strong SEO. Default locale and audience: **Nepal / Nepali readers**.

**Non-negotiable constraint:** Do not scrape and republish full verbatim articles from other outlets (Techpana, Barakharki, Setopati, etc.). Use them only as **source signals** (headline + short excerpt + link), then have the LLM **rewrite an original article** in our own words, citing/linking the original source. This keeps the site legally safe and avoids Google's duplicate-content penalty, which would also kill ad revenue.

---

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions, `next/image`)
- **UI:** shadcn/ui (latest, via `shadcn` CLI, not deprecated `shadcn-ui`), Tailwind CSS v4
- **Language:** TypeScript strict mode
- **ORM/DB:** Drizzle ORM + PostgreSQL (Neon or Supabase Postgres — use Neon for serverless-friendly pooling)
- **i18n:** `next-intl` (App Router compatible), locale-prefixed routing: `/ne/...` (default) and `/en/...`
- **Auth (admin panel only):** Auth.js (NextAuth) with credentials or magic link, single admin role
- **Content fetching:** RSS parsing (`rss-parser`) where feeds exist + `cheerio` for lightweight HTML parsing of listing/headline pages (headlines/excerpts only, respecting robots.txt)
- **LLM rewriting/translation:** Free-tier-friendly model via OpenRouter or Groq (e.g., Llama 3.1/3.3, Gemini Flash free tier) — abstract behind an `AIProvider` interface so the model is swappable
- **Dedup:** Title/content embedding similarity (via the same free LLM provider's embedding endpoint, or a local `sentence-transformers`-style API) + Postgres `pg_trgm` fuzzy matching as a cheap first-pass filter
- **Images:** Unsplash API / Pexels API (free, licensed) keyed by extracted article topic — never hotlink or scrape source-site images (copyright + hotlinking risk)
- **Scheduling:** Vercel Cron (`vercel.json` cron config hitting a protected `/api/cron/fetch-news` route) — every 2 hours
- **Ads:** Google AdSense (primary), with ad slot components placed for in-feed, in-article, and sidebar placements
- **SEO:** `next-sitemap`, dynamic `generateMetadata`, JSON-LD (`NewsArticle` schema), OpenGraph + Twitter cards, hreflang tags for `en`/`ne`
- **Hosting:** Vercel

---

## 3. Architecture Overview

```
┌─────────────────┐     every 2h      ┌──────────────────┐
│  Vercel Cron     │ ───────────────▶ │ /api/cron/fetch   │
└─────────────────┘                   └────────┬─────────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     ▼                            ▼                            ▼
             1. Fetch sources            2. Dedup check              3. Rewrite + translate
          (RSS + headline crawl)      (title/embedding similarity   (LLM: EN + NE versions,
          from allowed sources          vs last 7 days of posts)     engaging title, SEO meta)
                     │                            │                            │
                     └────────────────────────────┴──────────────┬─────────────┘
                                                                    ▼
                                                          4. Fetch relevant image
                                                          (Unsplash/Pexels API)
                                                                    ▼
                                                          5. Insert into Postgres
                                                          (status: published)
                                                                    ▼
                                                          6. Revalidate ISR paths
                                                          (/ne, /en, /ne/[slug], sitemap)
```

---

## 4. Database Schema (Drizzle)

```ts
// db/schema.ts
import { pgTable, serial, text, varchar, timestamp, boolean, integer, real, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 128 }).notNull(),
  nameNe: varchar("name_ne", { length: 128 }).notNull(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  baseUrl: text("base_url").notNull(),
  feedUrl: text("feed_url"), // RSS if available
  type: varchar("type", { length: 16 }).notNull(), // "rss" | "html"
  isActive: boolean("is_active").default(true),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slugEn: varchar("slug_en", { length: 256 }).notNull().unique(),
  slugNe: varchar("slug_ne", { length: 256 }).notNull().unique(),

  titleEn: text("title_en").notNull(),
  titleNe: text("title_ne").notNull(),

  excerptEn: text("excerpt_en").notNull(),
  excerptNe: text("excerpt_ne").notNull(),

  bodyEn: text("body_en").notNull(), // rendered HTML/MDX
  bodyNe: text("body_ne").notNull(),

  metaDescriptionEn: text("meta_description_en").notNull(),
  metaDescriptionNe: text("meta_description_ne").notNull(),

  categoryId: integer("category_id").references(() => categories.id),
  sourceId: integer("source_id").references(() => sources.id),
  sourceUrl: text("source_url").notNull(),      // original article link (attribution)
  sourceHeadline: text("source_headline").notNull(), // original headline, used for dedup fingerprint

  titleEmbedding: jsonb("title_embedding"),      // vector as array, or use pgvector extension
  contentHash: varchar("content_hash", { length: 64 }).notNull(), // sha256 of normalized source headline+excerpt

  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  imageCredit: text("image_credit"),             // Unsplash/Pexels photographer credit

  status: varchar("status", { length: 16 }).default("published"), // draft|published|archived
  viewCount: integer("view_count").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

> Prefer the Postgres `pgvector` extension over `jsonb` for `titleEmbedding` if the Postgres host supports it (Neon does via extension) — makes similarity search a native SQL `<->` operator instead of app-side cosine similarity.

---

## 5. Ingestion & Dedup Pipeline (`/api/cron/fetch-news`)

Protect this route with a secret header (`x-cron-secret`) checked against `process.env.CRON_SECRET`, set in `vercel.json`.

**Steps:**

1. **Pull candidates** from each active source (RSS first; fallback to a light `cheerio` fetch of the listing page for headline + link + short excerpt only — never pull full article bodies from source sites).
2. **Normalize** each candidate: strip whitespace/punctuation, lowercase, generate `contentHash = sha256(normalizedHeadline)`.
3. **Fast dedup pass:** reject candidate if `contentHash` matches any article from the last 14 days, or if Postgres `pg_trgm` similarity (`similarity(title, candidate_title) > 0.55`) matches an existing recent title.
4. **Semantic dedup pass:** for survivors, generate a title embedding via the LLM provider and reject if cosine similarity > 0.85 against any embedding from the last 7 days (catches same story worded differently across outlets).
5. **Rewrite pass** (for each unique candidate, LLM call):
   - Input: source headline + excerpt + source name (for context only, not to copy phrasing).
   - Output (structured JSON): `titleEn`, `titleNe`, `bodyEn` (400–700 words, original wording, inverted-pyramid news style), `bodyNe` (natural Nepali, not machine-literal translation), `excerptEn`, `excerptNe`, `metaDescriptionEn`, `metaDescriptionNe`, `category`, `suggestedImageKeywords`.
   - System prompt must explicitly instruct: "Do not copy phrases from the source. Write an original news article based on the facts. Attribute the source at the end (‘Based on reporting by [Source]’)."
6. **Image fetch:** query Unsplash/Pexels with `suggestedImageKeywords`; store URL + required photographer credit.
7. **Insert** into `articles` with `status: "published"`.
8. **Revalidate:** call `revalidatePath` for home, category pages, and the new article's EN/NE slugs; ping `next-sitemap` regeneration.
9. **Log** a cron run summary row (candidates found / deduped / published) for the admin dashboard.

Cap each run at e.g. 8 new articles to control LLM/API costs and avoid feed spam.

---

## 6. Site Structure (Next.js App Router)

```
app/
  [locale]/                      # "ne" (default) | "en"
    layout.tsx                   # locale provider, header/footer, ad slots
    page.tsx                     # homepage: trending grid + latest feed
    category/[slug]/page.tsx
    article/[slug]/page.tsx      # generateMetadata + JSON-LD NewsArticle
    search/page.tsx
  api/
    cron/fetch-news/route.ts
  sitemap.ts
  robots.ts
admin/                           # simple protected dashboard
  login/page.tsx
  dashboard/page.tsx             # cron run logs, manual "run now", edit/unpublish article
components/
  ads/
    AdSlot.tsx                   # wraps AdSense <ins>, lazy-loaded, layout-shift safe
  article/
    ArticleCard.tsx
    ArticleBody.tsx
  layout/
    Header.tsx (locale switcher, category nav)
    Footer.tsx
lib/
  db/ (drizzle client, schema, migrations)
  ai/ (provider interface + implementation, prompt templates)
  sources/ (per-source fetchers)
  dedup/
  images/ (unsplash/pexels client)
  seo/ (metadata + JSON-LD builders)
```

**Default locale = `ne`**, resolved by `next-intl` middleware; root `/` redirects to `/ne`. Detect via `Accept-Language` but fall back to `ne` for Nepal-region IPs.

---

## 7. SEO Requirements

- `generateMetadata` per article: title, description, canonical URL, OG image, `alternates.languages` (`en`/`ne` hreflang pair pointing at each other's translated slug).
- JSON-LD `NewsArticle` schema per article (headline, image, datePublished, author = site name, publisher with logo).
- `sitemap.ts` dynamically listing all published articles in both locales, updated on each cron run.
- `robots.ts` allowing crawl, pointing to sitemap.
- Fast Core Web Vitals: `next/image` for all images, ISR (`revalidate: 7200` matching the 2-hour cycle) rather than pure SSR, font optimization via `next/font`.

---

## 8. Ads Integration

- Google AdSense script loaded once in root layout via `next/script` (`strategy="afterInteractive"`).
- `<AdSlot />` component: reserves fixed height (avoid CLS), placements: below hero, mid-article (after ~3rd paragraph), sidebar (desktop only), between homepage feed cards every 6th item.
- Respect AdSense policy: no ads on pages with insufficient original content, no ads placed to cause accidental clicks, clear ad labeling.

---

## 9. Environment Variables

```
DATABASE_URL=
CRON_SECRET=
AI_PROVIDER_API_KEY=        # OpenRouter/Groq
UNSPLASH_ACCESS_KEY=
PEXELS_API_KEY=
NEXTAUTH_SECRET=
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_SITE_URL=
```

---

## 10. Build Order (for the agent to follow)

1. Scaffold Next.js 15 + TS + Tailwind + shadcn/ui; set up `next-intl` with `ne`/`en` message files and routing.
2. Set up Drizzle + Postgres (Neon), write schema above, run initial migration, seed `categories` and `sources`.
3. Build the `AIProvider` abstraction (rewrite + translate + embed functions) against a free-tier model.
4. Build source fetchers (start with 2–3 RSS-based sources; add HTML fallback fetcher for sites without RSS, respecting `robots.txt`).
5. Build dedup logic (hash + trigram + embedding).
6. Build `/api/cron/fetch-news` orchestrating steps 3–9 from Section 5.
7. Wire `vercel.json` cron entry for every 2 hours (`0 */2 * * *`).
8. Build homepage, category page, article page with shadcn components, responsive grid (mobile-first — majority of Nepali traffic is mobile).
9. Add SEO metadata, sitemap, robots, JSON-LD.
10. Add AdSense slots.
11. Add minimal admin dashboard: view cron logs, manually trigger a run, unpublish/edit an article.
12. Test dedup logic explicitly with two paraphrased versions of the same real headline to confirm only one gets published.
13. Deploy to Vercel, verify cron fires, verify hreflang/sitemap output, submit sitemap to Google Search Console, apply for AdSense once ~20–30 original articles exist (AdSense requires a content history — a fresh empty site will be rejected).

---

## 11. Legal/Compliance Notes to Bake In

- Store `sourceUrl` and display a visible "via [Source Name]" attribution link on every article — protects you and is standard aggregator practice.
- Never copy source images; use licensed stock photo APIs.
- Check each target source's `robots.txt` and Terms of Service before adding it as a fetcher; drop any that explicitly disallow automated access.
- Keep excerpts pulled from source pages short (headline + 1–2 sentences) — used only as LLM input, never rendered directly on the site.
