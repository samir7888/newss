import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleReader } from "@/components/article/ArticleReader";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { ShareButtons } from "@/components/article/ShareButtons";
import { LikeButton } from "@/components/article/LikeButton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { toRichHtml } from "@/lib/article-content";
import { getAllArticleSlugs, getArticleBySlug, getCategories, getRelatedArticles } from "@/lib/news-data";
import { formatFullDate, formatRelativeTime, calculateReadTime } from "@/lib/format-date";
import { getCategoryTheme } from "@/lib/category-theme";
import type { Locale } from "@/lib/site";

export const revalidate = 3600; // Revalidate every 1 hour (3600s) + on-demand via /api/revalidate
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
  const currentSlug =
    resolvedLocale === "ne" && "slugNe" in article
      ? article.slugNe
      : article.slug;
  const canonicalPath = `/${resolvedLocale}/article/${currentSlug || slug}`;

  return {
    title: `${title} | नेपाली समाचार`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: article.image }],
      type: "article",
      publishedTime: article.publishedAt,
      url: canonicalPath,
      siteName: "नेपाली समाचार | Nepali Samachar",
    },
    alternates: {
      canonical: canonicalPath,
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

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://nepalisamachar.xyz"
  ).replace(/\/$/, "");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title[resolvedLocale],
    description: article.excerpt[resolvedLocale],
    image: [article.image],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: resolvedLocale === "ne" ? "ne-NP" : "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/${resolvedLocale}/article/${currentSlug}`,
    },
    author: {
      "@type": "Organization",
      name: "Nepali Samachar Editorial Desk",
      url: siteUrl,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Nepali Samachar",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
                unoptimized
                sizes="(max-width: 768px) 100vw, 760px"
                className="object-cover"
              />
            </div>
            {article.imageCredit && (
              <figcaption className="mt-2 text-xs text-slate-500 text-right flex items-center justify-end gap-1">
                <span>{resolvedLocale === "ne" ? "तस्बिर:" : "Photo:"}</span>
                {article.imageCreditUrl ? (
                  <a
                    href={article.imageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {article.imageCredit}
                  </a>
                ) : (
                  <span>{article.imageCredit}</span>
                )}
              </figcaption>
            )}
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
            source={resolvedLocale === "ne" ? "सम्पादकीय टोली" : "Editorial Desk"}
            readTime={readTime}
            bodyHtml={bodyHtml}
            bodyText={rawBodyText}
            locale={resolvedLocale}
          />

          {/* LIKE BUTTON (below body content) */}
          <div className="flex items-center justify-center py-2 no-print">
            <LikeButton
              slug={currentSlug}
              locale={resolvedLocale}
              initialLikes={article.likesCount}
            />
          </div>

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
              url={`/${resolvedLocale}/article/${currentSlug}`}
            />
          </div>

          {/* EDITORIAL INTEGRITY & ORIGINAL REPORTING GUARANTEE */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 text-sm text-slate-700 no-print">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                {resolvedLocale === "ne"
                  ? "मौलिक पत्रकारिता तथा सम्पादकीय ग्यारेन्टी"
                  : "Original Reporting & Editorial Standards"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {resolvedLocale === "ne"
                ? "यो समाचार सामग्री नेपाली समाचार (Nepali Samachar) को सम्पादकीय टोलीद्वारा तथ्य प्रमाणीकरण, स्थलगत अनुसन्धान र स्वतन्त्र विश्लेषणका साथ तयार पारिएको मौलिक प्रकाशन हो। हामी निष्पक्ष, सन्तुलित र सत्यतथ्य सूचना सम्प्रेषण गर्न प्रतिबद्ध छौं।"
                : "This article is an original report researched, verified, and produced by the Nepali Samachar editorial desk. We adhere to independent reporting standards and ethical, fact-checked journalism."}
            </p>
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
