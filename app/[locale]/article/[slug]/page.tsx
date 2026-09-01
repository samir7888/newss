import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ShareButtons } from "@/components/article/ShareButtons";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toRichHtml } from "@/lib/article-content";
import { getArticleBySlug, getCategories, getRelatedArticles } from "@/lib/news-data";

export function generateStaticParams() {
    return [{ locale: "ne" }, { locale: "en" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";
    const article = await getArticleBySlug(resolvedLocale, slug);
    if (!article) return {};
    return {
        title: article.title[resolvedLocale],
        description: article.excerpt[resolvedLocale],
        alternates: {
            languages: {
                ne: `/ne/article/${slug}`,
                en: `/en/article/${slug}`,
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
    const resolvedLocale = locale === "en" ? "en" : "ne";

    if (!["ne", "en"].includes(resolvedLocale)) notFound();

    const [article, categories] = await Promise.all([
        getArticleBySlug(resolvedLocale, slug),
        getCategories(),
    ]);

    if (!article) notFound();

    const category = categories.find((item) => item.slug === article.category);
    const articleId = "id" in article && typeof article.id === "number" ? article.id : -1;
    const relatedArticles = await getRelatedArticles(article.category, articleId);
    const alternateSlug = resolvedLocale === "ne" ? article.slugEn : article.slugNe;
    const alternateHref = `/${resolvedLocale === "ne" ? "en" : "ne"}/article/${alternateSlug}`;
    const bodyHtml = "bodyHtml" in article && article.bodyHtml
        ? (article.bodyHtml as { ne: string; en: string })[resolvedLocale]
        : toRichHtml(article.body[resolvedLocale].join("\n\n"));

    return (
        <>
            <Header locale={resolvedLocale} alternateHref={alternateHref} />
            <main className="container-shell py-8 md:py-10">
                <article className="mx-auto max-w-6xl">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <Link href={`/${resolvedLocale}`} className="font-medium text-emerald-700">
                            {resolvedLocale === "ne" ? "होम" : "Home"}
                        </Link>
                        <span>•</span>
                        <Link href={`/${resolvedLocale}/category/${article.category}`} className="font-medium text-emerald-700">
                            {resolvedLocale === "ne" ? category?.name.ne : category?.name.en}
                        </Link>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString(resolvedLocale === "ne" ? "ne-NP" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>

                    <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                        {article.title[resolvedLocale]}
                    </h1>

                    <p className="mt-4 max-w-4xl text-xl leading-9 text-slate-600">{article.excerpt[resolvedLocale]}</p>



                    <div className="relative mt-8 h-80 overflow-hidden rounded-3xl border border-slate-200 bg-white md:h-120">
                        <Image src={article.image} alt={article.imageAlt[resolvedLocale]} fill className="object-top object-cover" />
                    </div>

                    <div
                        className="article-body mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8"
                        dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />

                    <ShareButtons
                        title={article.title[resolvedLocale]}
                        label={resolvedLocale === "ne" ? "यो समाचार साझा गर्नुहोस्" : "Share this story"}
                    />

                    <AdSlot label={resolvedLocale === "ne" ? "अन्तरमध्य विज्ञापन" : "In-article ad"} />

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                        {resolvedLocale === "ne" ? "स्रोत: " : "Source: "}
                        <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline">
                            {article.source}
                        </a>
                    </div>

                    {relatedArticles.length > 0 && (
                        <section className="mt-12">
                            <div className="mb-5 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                        {resolvedLocale === "ne" ? "सम्बन्धित" : "More to read"}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                        {resolvedLocale === "ne" ? "सम्बन्धित समाचार" : "Related stories"}
                                    </h2>
                                </div>
                            </div>
                            <div className="grid gap-5 md:grid-cols-3">
                                {relatedArticles.map((relatedArticle) => (
                                    <ArticleCard key={"id" in relatedArticle && typeof relatedArticle.id === "number" ? relatedArticle.id : relatedArticle.slug} article={relatedArticle} locale={resolvedLocale} />
                                ))}
                            </div>
                        </section>
                    )}
                </article>
            </main>
            <Footer locale={resolvedLocale} />
        </>
    );
}
