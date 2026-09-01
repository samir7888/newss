import Link from "next/link";
import { Search, ChevronRight, Filter } from "lucide-react";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { searchArticles, getCategories } from "@/lib/news-data";
import type { Locale } from "@/lib/site";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";
  const query = (await searchParams).q ?? "";
  const [results, categoriesList] = await Promise.all([
    searchArticles(query),
    getCategories(),
  ]);

  const quickPills =
    resolvedLocale === "ne"
      ? ["बाढी", "पुल", "भलिबल", "अर्थ", "प्रविधि", "बादशाह"]
      : ["Floods", "Bridges", "Volleyball", "Economy", "Tech", "Celebrity"];

  return (
    <>
      <Header locale={resolvedLocale} />

      <main className="container-shell py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href={`/${resolvedLocale}`} className="hover:text-red-700 font-medium">
              {resolvedLocale === "ne" ? "गृहपृष्ठ" : "Home"}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-700 font-semibold">
              {resolvedLocale === "ne" ? "समाचार खोज्नुहोस्" : "Search News"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-2">
            {resolvedLocale === "ne" ? "समाचार खोज्नुहोस्" : "Search Stories"}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {resolvedLocale === "ne"
              ? "कुनै पनि विषय, व्यक्ति वा शीर्षक खोज्न तल टाइप गर्नुहोस्।"
              : "Search across all articles by keywords, topics, or names."}
          </p>

          {/* Search Form */}
          <form method="get" className="relative mb-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                autoFocus={!query}
                placeholder={
                  resolvedLocale === "ne"
                    ? "समाचार, शीर्षक वा विषय खोज्नुहोस्..."
                    : "Search stories by keyword..."
                }
                className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-28 py-3.5 text-base text-slate-900 shadow-xs outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100"
              />
              <button
                type="submit"
                className="absolute right-2.5 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
              >
                {resolvedLocale === "ne" ? "खोज्नुहोस्" : "Search"}
              </button>
            </div>
          </form>

          {/* Quick search suggestion pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs text-slate-500">
            <span className="font-semibold">
              {resolvedLocale === "ne" ? "सुझाव:" : "Popular tags:"}
            </span>
            {quickPills.map((pill) => (
              <Link
                key={pill}
                href={`/${resolvedLocale}/search?q=${encodeURIComponent(pill)}`}
                className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-800 transition font-medium"
              >
                #{pill}
              </Link>
            ))}
          </div>

          {/* Search Results Summary */}
          {query && (
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 text-sm text-slate-600">
              <span>
                {resolvedLocale === "ne"
                  ? `"${query}" का लागि ${results.length} परिणाम भेटियो`
                  : `Found ${results.length} results for "${query}"`}
              </span>
              {results.length > 0 && (
                <span className="text-xs text-slate-400">
                  {resolvedLocale === "ne" ? "ताजा नतिजा" : "Latest matches"}
                </span>
              )}
            </div>
          )}

          {/* Results List */}
          <div className="space-y-2">
            {results.length > 0 ? (
              <div className="divide-y divide-slate-200/80">
                {results.map((article) => (
                  <ArticleCard
                    key={article.slug}
                    article={article}
                    locale={resolvedLocale}
                    layout="list-row"
                  />
                ))}
              </div>
            ) : query ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
                <Filter className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-base font-semibold">
                  {resolvedLocale === "ne"
                    ? `"${query}" सँग सम्बन्धित कुनै समाचार फेला परेन।`
                    : `No stories matched "${query}".`}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {resolvedLocale === "ne"
                    ? "कृपया फरक शब्द प्रयोग गरेर पुनः खोज्नुहोस्।"
                    : "Try searching with different keywords or topic tags."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer locale={resolvedLocale} />
    </>
  );
}
