import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ExternalLink, Globe, ShieldCheck, ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleReader } from "@/components/article/ArticleReader";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { ShareButtons } from "@/components/article/ShareButtons";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { toRichHtml } from "@/lib/article-content";
import { getAllArticleSlugs, getArticleBySlug, getCategories, getRelatedArticles } from "@/lib/news-data";
import { formatFullDate, formatRelativeTime, calculateReadTime } from "@/lib/format-date";
import { getCategoryTheme } from "@/lib/category-theme";
import type { Locale } from "@/lib/site";

export const revalidate = 60; // Revalidate every 1 minute (60s)
export const dynamicParams = true;

export async function generateStaticParams() {
  return await getAllArticleSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";
  const article = await getArticleBySlug(resolvedLocale, slug);
  if (!article) return {};

  const title = article.title[resolvedLocale];
  const description = article.excerpt[resolvedLocale];

  return {
    title: `${title} | ताजा समाचार`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: article.image }],
      type: "article",
      publishedTime: article.publishedAt,
    },
    alternates: {
      languages: {
        ne: `/ne/article/${article.slugNe || slug}`,
        en: `/en/article/${article.slugEn || slug}`,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";

  if (!["ne", "en"].includes(resolvedLocale)) notFound();

  const [article, categoriesList] = await Promise.all([
    getArticleBySlug(resolvedLocale, slug),
    getCategories(),
  ]);

  if (!article) notFound();

  const category = categoriesList.find((item) => item.slug === article.category);
  const categoryName = category ? category.name[resolvedLocale] : article.category;
  const theme = getCategoryTheme(article.category);
  const articleId =
    "id" in article && typeof article.id === "number" ? article.id : -1;
  const relatedArticles = await getRelatedArticles(article.category, articleId);

  const currentSlug =
    resolvedLocale === "ne" && "slugNe" in article
      ? article.slugNe
      : article.slug;
  const alternateSlug =
    resolvedLocale === "ne" ? article.slugEn : article.slugNe;
  const alternateHref = `/${resolvedLocale === "ne" ? "en" : "ne"}/article/${alternateSlug}`;

  const timeAgo = formatRelativeTime(article.publishedAt, resolvedLocale);
  const fullDate = formatFullDate(article.publishedAt, resolvedLocale);

  const rawBodyText = article.body[resolvedLocale].join("\n\n");
  const readTime = calculateReadTime(rawBodyText, resolvedLocale);

  const bodyHtml =
    "bodyHtml" in article && article.bodyHtml
      ? (article.bodyHtml as { ne: string; en: string })[resolvedLocale]
      : toRichHtml(rawBodyText, resolvedLocale);

  return (
    <>
      <ReadingProgress />
      <Header locale={resolvedLocale} alternateHref={alternateHref} />

      <main className="container-shell py-6 sm:py-10">
        <article className="mx-auto max-w-[760px]">
          {/* ============================================================= */}
          {/* §2: ARTICLE HEADER (Category · Time · 1-Tap EN/NE Switch) */}
          {/* ============================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 text-xs sm:text-sm no-print">
            <div className="flex items-center gap-2 text-slate-500 flex-wrap">
              <Link
                href={`/${resolvedLocale}`}
                className="hover:text-red-700 font-medium transition"
              >
                {resolvedLocale === "ne" ? "गृहपृष्ठ" : "Home"}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <Link
                href={`/${resolvedLocale}/category/${article.category}`}
                className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md border ${theme.bg} ${theme.text} ${theme.border}`}
              >
                {categoryName}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3 w-3 text-slate-400" />
                {timeAgo}
              </span>
            </div>

           
          </div>

          {/* §2: LARGE HEADLINE (Owns the top of page) */}
          <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-slate-950 leading-[1.22] text-balance">
            {article.title[resolvedLocale]}
          </h1>

          {/* EXCERPT */}
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
            {article.excerpt[resolvedLocale]}
          </p>

        

          {/* ============================================================= */}
          {/* §6: HERO IMAGE WITH VISIBLE CAPTION + PHOTO CREDIT */}
          {/* ============================================================= */}
          <figure className="my-6">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/80">
              <Image
                src={article.image}
                alt={article.imageAlt[resolvedLocale] || article.title[resolvedLocale]}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 760px"
                className="object-cover"
              />
            </div>
            
          </figure>

          {/* ============================================================= */}
          {/* INTERACTIVE ARTICLE READER (Font size scaling + Bookmark) */}
          {/* ============================================================= */}
          <ArticleReader
            slug={currentSlug}
            title={article.title[resolvedLocale]}
            category={categoryName}
            image={article.image}
            publishedAt={article.publishedAt}
            source={article.source}
            readTime={readTime}
            bodyHtml={bodyHtml}
            locale={resolvedLocale}
          />

          {/* §5: IN-ARTICLE AD UNIT (Clearly boxed & labelled) */}
          <AdSlot variant="in-article" locale={resolvedLocale} className="no-print" />

          {/* SHARE BUTTONS */}
          <div className="no-print">
            <ShareButtons
              title={article.title[resolvedLocale]}
              label={
                resolvedLocale === "ne"
                  ? "यो समाचार साझा गर्नुहोस्"
                  : "Share this story"
              }
            />
          </div>

          {/* ORIGINAL SOURCE VERIFICATION CARD */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-700 no-print">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                {resolvedLocale === "ne"
                  ? "स्रोत तथा आधिकारिकता"
                  : "Source & Attribution"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {resolvedLocale === "ne"
                ? `यो समाचार मूल रूपमा ${article.source} मा प्रकाशित भएको थियो। पूर्ण सन्दर्भ र आधिकारिक विवरणका लागि मूल स्रोत हेर्न सक्नुहुन्छ:`
                : `This report was originally published by ${article.source}. For direct verification and additional reporting:`}
            </p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 hover:underline"
            >
              <span>
                {resolvedLocale === "ne"
                  ? `${article.source} को मूल समाचार पढ्नुहोस्`
                  : `Read original at ${article.source}`}
              </span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* ============================================================= */}
          {/* §2: RELATED STORIES (3 dense cards at the end) */}
          {/* ============================================================= */}
          {relatedArticles.length > 0 && (
            <section className="mt-14 pt-8 border-t-2 border-slate-900 no-print">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <span className="inline-block h-3.5 w-1 bg-red-700 rounded-xs" />
                  <span>
                    {resolvedLocale === "ne"
                      ? "सम्बन्धित समाचारहरू"
                      : "Related Stories"}
                  </span>
                </h2>
                <Link
                  href={`/${resolvedLocale}/category/${article.category}`}
                  className="text-xs font-bold text-red-700 hover:underline"
                >
                  {resolvedLocale === "ne"
                    ? `${categoryName} का थप समाचार →`
                    : `More in ${categoryName} →`}
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {relatedArticles.slice(0, 3).map((rel) => (
                  <ArticleCard
                    key={"id" in rel && typeof rel.id === "number" ? rel.id : rel.slug}
                    article={rel}
                    locale={resolvedLocale}
                    layout="grid-card"
                  />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <ScrollToTop />
      <Footer locale={resolvedLocale} />
    </>
  );
}
