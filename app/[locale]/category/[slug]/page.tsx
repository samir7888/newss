import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Filter, TrendingUp } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/article/ArticleCard";
import { NewsletterBox } from "@/components/article/NewsletterBox";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { getArticlesByCategory, getCategories, getLatestArticles } from "@/lib/news-data";
import { getCategoryTheme } from "@/lib/category-theme";
import type { Locale } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 1800; // Revalidate every 30 minutes (1800s) + on-demand via /api/revalidate
export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { locale: "ne", slug: "politics" },
    { locale: "en", slug: "politics" },
    { locale: "ne", slug: "economy" },
    { locale: "en", slug: "economy" },
    { locale: "ne", slug: "technology" },
    { locale: "en", slug: "technology" },
    { locale: "ne", slug: "culture" },
    { locale: "en", slug: "culture" },
    { locale: "ne", slug: "sports" },
    { locale: "en", slug: "sports" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";
  const categoriesList = await getCategories();
  const category = categoriesList.find((item) => item.slug === slug);
  const categoryName = category ? category.name[resolvedLocale] : slug;

  const title =
    resolvedLocale === "ne"
      ? `${categoryName} समाचार | ताजा अपडेट - नेपाली समाचार`
      : `${categoryName} News | Latest Updates - Nepali Samachar`;
  const description =
    resolvedLocale === "ne"
      ? `${categoryName} सम्बन्धी ताजा र महत्त्वपूर्ण समाचारहरू।`
      : `Latest news and in-depth updates on ${categoryName} from Nepal.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${resolvedLocale}/category/${slug}`,
      languages: {
        ne: `/ne/category/${slug}`,
        en: `/en/category/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/${resolvedLocale}/category/${slug}`,
      siteName: "नेपाली समाचार | Nepali Samachar",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";

  if (!["ne", "en"].includes(resolvedLocale)) notFound();

  const [categoriesList, items, latestStories] = await Promise.all([
    getCategories(),
    getArticlesByCategory(slug),
    getLatestArticles(5),
  ]);

  const category = categoriesList.find((item) => item.slug === slug);
  if (!category) notFound();

  const categoryName = category.name[resolvedLocale];
  const theme = getCategoryTheme(slug);

  return (
    <>
      <Header locale={resolvedLocale} />

      <main className="container-shell py-6 sm:py-8">
        {/* ============================================================= */}
        {/* CATEGORY HEADER (Browsing header, no hero replication per §2) */}
        {/* ============================================================= */}
        <div className="mb-6 pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href={`/${resolvedLocale}`} className="hover:text-red-700 font-medium">
              {resolvedLocale === "ne" ? "गृहपृष्ठ" : "Home"}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-700 font-semibold">{categoryName}</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-3.5 w-1 rounded-xs ${theme.dot}`} />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950">
                  {categoryName}
                </h1>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                {resolvedLocale === "ne"
                  ? `${categoryName} सम्बन्धी ताजा र महत्त्वपूर्ण समाचारहरू (${items.length} समाचार फेला पर्यो)`
                  : `Latest updates and reports in ${categoryName} (${items.length} stories)`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-md border ${theme.bg} ${theme.text} ${theme.border}`}>
                {category.name[resolvedLocale === "ne" ? "en" : "ne"]}
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard ad slot */}
        <AdSlot variant="leaderboard" locale={resolvedLocale} />

        {/* ============================================================= */}
        {/* §2: LIST FEED LAYOUT (Matching homepage feed, dense list) */}
        {/* ============================================================= */}
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] items-start">
          <section aria-label="Category Stories">
            {items.length > 0 ? (
              <div className="divide-y divide-slate-200/80">
                {items.map((article, index) => (
                  <div key={article.slug}>
                    <ArticleCard
                      article={article}
                      locale={resolvedLocale}
                      layout="list-row"
                    />
                    {(index + 1) % 5 === 0 && index !== items.length - 1 && (
                      <AdSlot
                        variant="in-feed"
                        locale={resolvedLocale}
                        className="my-4"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
                <Filter className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-base font-semibold">
                  {resolvedLocale === "ne"
                    ? "यस श्रेणीमा अहिले समाचारहरू छैनन्।"
                    : "No stories in this category yet."}
                </p>
                <Link
                  href={`/${resolvedLocale}`}
                  className="mt-3 inline-block text-xs font-bold text-red-700 hover:underline"
                >
                  {resolvedLocale === "ne" ? "गृहपृष्ठमा फर्कनुहोस् →" : "Back to homepage →"}
                </Link>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-8 sticky top-20">
            {/* Newsletter Subscription */}
            <NewsletterBox locale={resolvedLocale} />

            {/* Other categories */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-100">
                {resolvedLocale === "ne" ? "अन्य श्रेणीहरू" : "Other Categories"}
              </h3>
              <div className="flex flex-col space-y-1">
                {categoriesList.map((cat) => {
                  const catTheme = getCategoryTheme(cat.slug);
                  const isCurrent = cat.slug === slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/${resolvedLocale}/category/${cat.slug}`}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition ${
                        isCurrent
                          ? "bg-slate-900 text-white shadow-xs"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${catTheme.dot}`} />
                        <span>{resolvedLocale === "ne" ? cat.name.ne : cat.name.en}</span>
                      </span>
                      <span className={isCurrent ? "text-slate-300" : "text-slate-400"}>
                        {cat.name[resolvedLocale === "ne" ? "en" : "ne"]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sidebar ad slot */}
            <AdSlot variant="sidebar" locale={resolvedLocale} />

            {/* Latest across all news */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span>{resolvedLocale === "ne" ? "ताजा अन्य समाचार" : "Recent Across All"}</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {latestStories.map((story, i) => (
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
          </aside>
        </div>
      </main>

      <ScrollToTop />
      <Footer locale={resolvedLocale} />
    </>
  );
}
