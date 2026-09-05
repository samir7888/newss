import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, TrendingUp, Flame, ShieldCheck, Newspaper } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/article/ArticleCard";
import { NewsletterBox } from "@/components/article/NewsletterBox";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { getCategories, getLatestArticles } from "@/lib/news-data";
import { formatRelativeTime } from "@/lib/format-date";
import { getCategoryTheme } from "@/lib/category-theme";
import type { Metadata } from "next";
import type { Locale } from "@/lib/site";

export const revalidate = 60; // Revalidate every 1 minute (60s)

export function generateStaticParams() {
  return [{ locale: "ne" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";
  const canonicalPath = resolvedLocale === "ne" ? "/" : "/en";

  return {
    alternates: {
      canonical: canonicalPath,
      languages: {
        ne: "/",
        en: "/en",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";

  if (!["ne", "en"].includes(resolvedLocale)) {
    notFound();
  }

  const [articles, categoriesList] = await Promise.all([
    getLatestArticles(24),
    getCategories(),
  ]);

  if (!articles.length) {
    return (
      <>
        <Header locale={resolvedLocale} />
        <main className="container-shell py-12">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h1 className="text-xl font-bold text-slate-800">
              {resolvedLocale === "ne"
                ? "अहिले कुनै समाचार फेला परेन"
                : "No news stories available yet"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {resolvedLocale === "ne"
                ? "कृपया केही समयपछि पुनः प्रयास गर्नुहोस् वा नयाँ समाचार अपडेट गर्नुहोस्।"
                : "Please check back shortly or run the news fetcher."}
            </p>
          </div>
        </main>
        <Footer locale={resolvedLocale} />
      </>
    );
  }

  // 1 dominant lead story + 3 secondary top stories
  const leadStory = articles[0];
  const secondaryStories = articles.slice(1, 6);
  const feedStories = articles.slice(4);
  const trendingStories = articles.slice(0, 5);

  // Breaking ticker items
  const tickerItems = articles.slice(0, 6).map((item) => ({
    slug:
      resolvedLocale === "ne" && "slugNe" in item ? item.slugNe : item.slug,
    title: item.title[resolvedLocale],
  }));

  const leadSlug =
    resolvedLocale === "ne" && "slugNe" in leadStory
      ? leadStory.slugNe
      : leadStory.slug;
  const leadCategory = categoriesList.find((c) => c.slug === leadStory.category);
  const leadCategoryName = leadCategory
    ? leadCategory.name[resolvedLocale]
    : leadStory.category;
  const leadTheme = getCategoryTheme(leadStory.category);
  const leadTimeAgo = formatRelativeTime(leadStory.publishedAt, resolvedLocale);

  return (
    <>
      <Header locale={resolvedLocale} tickerItems={tickerItems} />

      <main className="container-shell py-6 sm:py-8">
        {/* ================================================================= */}
        {/* §2 & §7: ONE DOMINANT LEAD STORY + 2-3 SECONDARY STORIES (HERO) */}
        {/* ================================================================= */}
        <section aria-label="Top Stories" className="mb-8">
          <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
            {/* DOMINANT LEAD STORY (The ONE bold moment per SKILL.md §7) */}
            <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:shadow-md">
              <Link
                href={`/${resolvedLocale}/article/${leadSlug}`}
                className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 block"
              >
                <Image
                  src={leadStory.image}
                  alt={leadStory.imageAlt[resolvedLocale] || leadStory.title[resolvedLocale]}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover transition duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent sm:hidden" />
                <div className="absolute bottom-3 left-3 sm:hidden text-white pr-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${leadTheme.bg} ${leadTheme.text} mb-1.5`}
                  >
                    {leadCategoryName}
                  </span>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-5 sm:p-7">
                <div className="hidden sm:flex items-center gap-2.5 mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border ${leadTheme.bg} ${leadTheme.text} ${leadTheme.border}`}
                  >
                    {leadCategoryName}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {leadTimeAgo}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {resolvedLocale === "ne" ? "सम्पादकीय" : "Editorial Desk"}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-slate-950 group-hover:text-red-700 transition">
                  <Link href={`/${resolvedLocale}/article/${leadSlug}`}>
                    {leadStory.title[resolvedLocale]}
                  </Link>
                </h1>

                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 line-clamp-3">
                  {leadStory.excerpt[resolvedLocale]}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/${resolvedLocale}/article/${leadSlug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 transition"
                  >
                    <span>{resolvedLocale === "ne" ? "विस्तृत पढ्नुहोस्" : "Read full story"}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>

            {/* 2-3 SECONDARY STORIES STACKED BESIDE LEAD */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-red-600" />
                  <span>{resolvedLocale === "ne" ? "विशेष खबरहरू" : "Top Highlights"}</span>
                </h2>
                <span className="text-xs text-slate-400">
                  {resolvedLocale === "ne" ? "आजको चयन" : "Today's Picks"}
                </span>
              </div>

              {secondaryStories.map((story) => {
                const storySlug =
                  resolvedLocale === "ne" && "slugNe" in story
                    ? story.slugNe
                    : story.slug;
                const storyCat = categoriesList.find((c) => c.slug === story.category);
                const storyCatName = storyCat ? storyCat.name[resolvedLocale] : story.category;
                const storyTheme = getCategoryTheme(story.category);
                const storyTimeAgo = formatRelativeTime(story.publishedAt, resolvedLocale);

                return (
                  <article
                    key={story.slug}
                    className="group relative flex gap-4 p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs transition"
                  >
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10.5px] font-semibold rounded-xs ${storyTheme.bg} ${storyTheme.text}`}
                          >
                            {storyCatName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {storyTimeAgo}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold leading-snug text-slate-950 group-hover:text-red-700 transition line-clamp-2">
                          <Link href={`/${resolvedLocale}/article/${storySlug}`}>
                            <span className="absolute inset-0" aria-hidden="true" />
                            {story.title[resolvedLocale]}
                          </Link>
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-2 font-medium">
                        {resolvedLocale === "ne" ? "सम्पादकीय" : "Editorial Desk"}
                      </span>
                    </div>

                    <div className="relative h-20 w-24 sm:h-22 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={story.image}
                        alt={story.imageAlt[resolvedLocale] || story.title[resolvedLocale]}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* §2 & §5: LEADERBOARD AD SLOT (Reserved fixed height, zero CLS) */}
        {/* ================================================================= */}
        <AdSlot variant="leaderboard" locale={resolvedLocale} />

        {/* ================================================================= */}
        {/* §2: MAIN FEED (DENSE IMAGE-LEFT ROWS) + SIDEBAR */}
        {/* ================================================================= */}
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] items-start">
          {/* LEFT: LATEST NEWS FEED */}
          <section aria-label="Latest News">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-900">
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                <span className="inline-block h-3.5 w-1 bg-red-700 rounded-xs" />
                <span>{resolvedLocale === "ne" ? "भर्खरका समाचार" : "Latest Stories"}</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {resolvedLocale === "ne" ? "समय अनुसार क्रमबद्ध" : "Chronological feed"}
              </span>
            </div>

            <div className="divide-y divide-slate-200/80">
              {feedStories.map((article, index) => (
                <div key={article.slug}>
                  <ArticleCard
                    article={article}
                    locale={resolvedLocale}
                    layout="list-row"
                  />
                  {/* Insert native ad every 5th item per SKILL.md §2 & §5 */}
                  {(index + 1) % 5 === 0 && index !== feedStories.length - 1 && (
                    <AdSlot
                      variant="in-feed"
                      locale={resolvedLocale}
                      className="my-4"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: DESKTOP SIDEBAR */}
          <aside className="space-y-8 sticky top-20">
            {/* 1. Daily Newsletter / News Digest Box */}
            <NewsletterBox locale={resolvedLocale} />

            {/* 2. Trending / Most Read Widget */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span>{resolvedLocale === "ne" ? "धेरै पढिएका समाचार" : "Trending Stories"}</span>
                </h3>
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  HOT
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {trendingStories.map((story, i) => (
                  <ArticleCard
                    key={story.slug}
                    article={story}
                    locale={resolvedLocale}
                    layout="compact"
                    rank={i + 1}
                  />
                ))}
              </div>
            </div>

            {/* 3. Sidebar Ad Unit (300x250 with reserved height) */}
            <AdSlot variant="sidebar" locale={resolvedLocale} />

            {/* 4. Category Quick Explore */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-100">
                {resolvedLocale === "ne" ? "विषय अनुसार पढ्नुहोस्" : "Browse by Topic"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoriesList.map((cat) => {
                  const theme = getCategoryTheme(cat.slug);
                  return (
                    <Link
                      key={cat.slug}
                      href={`/${resolvedLocale}/category/${cat.slug}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition hover:scale-103 ${theme.bg} ${theme.text} ${theme.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                      <span>{resolvedLocale === "ne" ? cat.name.ne : cat.name.en}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 5. Original Journalism & Verification Card */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>
                  {resolvedLocale === "ne"
                    ? "मौलिक तथा खोजमूलक पत्रकारिता"
                    : "Original & Verified Journalism"}
                </span>
              </div>
              <p>
                {resolvedLocale === "ne"
                  ? "हाम्रो सम्पादकीय टोलीले स्थलगत अनुसन्धान, तथ्य प्रमाणीकरण र गहन विश्लेषणसहित मौलिक द्विभाषिक समाचार सामग्रीहरू सम्प्रेषण गर्दछ।"
                  : "Our newsroom produces original reporting, verified facts, and comprehensive bilingual news coverage across Nepal."}
              </p>
            </div>
          </aside>
        </div>
      </main>

      <ScrollToTop />
      <Footer locale={resolvedLocale} />
    </>
  );
}
