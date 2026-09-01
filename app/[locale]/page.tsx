import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCategories, getLatestArticles } from "@/lib/news-data";
import Image from "next/image";

const localeNames = {
    ne: "नेपाली",
    en: "English",
} as const;

export function generateStaticParams() {
    return [{ locale: "ne" }, { locale: "en" }];
}

export default async function LocaleHomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";

    if (!["ne", "en"].includes(resolvedLocale)) {
        notFound();
    }

    const [articles, categories] = await Promise.all([
        getLatestArticles(9),
        getCategories(),
    ]);

    if (!articles.length) {
        return (
            <>
                <Header locale={resolvedLocale} />
                <main className="container-shell py-8 md:py-10">
                    <section className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{localeNames[resolvedLocale]}</p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                                {resolvedLocale === "ne" ? "ट्रेन्डिङ समाचार" : "Trending News"}
                            </h1>
                        </div>
                    </section>
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                        {resolvedLocale === "ne" ? "अहिले डेटाबेसमा कुनै वास्तविक समाचार छैन।" : "There are no live stories in the database yet."}
                    </div>
                </main>
                <Footer locale={resolvedLocale} />
            </>
        );
    }

    const heroArticle = articles[0];
    const remaining = articles.slice(1);
    const heroSlug = resolvedLocale === "ne" && "slugNe" in heroArticle ? heroArticle.slugNe : heroArticle.slug;

    return (
        <>
            <Header locale={resolvedLocale} />
            <main className="container-shell py-8 md:py-10">
                <section className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{localeNames[resolvedLocale]}</p>
                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                            {resolvedLocale === "ne" ? "ट्रेन्डिङ समाचार" : "Trending News"}
                        </h1>
                    </div>
                    <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                        {resolvedLocale === "ne" ? "आजको अपडेट" : "Latest updates"}
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
                    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="relative min-h-80 w-full overflow-hidden">
                            <Image src={heroArticle.image} alt={heroArticle.imageAlt[resolvedLocale]} fill className="object-top object-cover" />
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="mb-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                {categories.find((category) => category.slug === heroArticle.category)?.name[resolvedLocale] || heroArticle.category}
                            </div>
                            <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-4xl">
                                {heroArticle.title[resolvedLocale]}
                            </h2>
                            <p className="mt-4 text-base leading-7 text-slate-600">{heroArticle.excerpt[resolvedLocale]}</p>
                            <div className="mt-6 flex items-center justify-between gap-4">

                                <Link href={`/${resolvedLocale}/article/${heroSlug}`} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                                    {resolvedLocale === "ne" ? "पूरा समाचार" : "Read story"}
                                </Link>
                            </div>
                        </div>
                    </article>

                    <aside className="space-y-4">
                        {remaining.slice(0, 3).map((article) => (
                            <Link key={article.slug} href={`/${resolvedLocale}/article/${resolvedLocale === "ne" && "slugNe" in article ? article.slugNe : article.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                    {categories.find((category) => category.slug === article.category)?.name[resolvedLocale] || article.category}
                                </div>
                                <h3 className="text-lg font-semibold leading-snug text-slate-900">{article.title[resolvedLocale]}</h3>
                                <p className="mt-2 text-sm text-slate-600">{article.excerpt[resolvedLocale]}</p>
                            </Link>
                        ))}
                    </aside>
                </section>

                <AdSlot label={resolvedLocale === "ne" ? "विज्ञापन" : "Advertisement"} />

                <section className="mt-10">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {resolvedLocale === "ne" ? "भर्खरका समाचार" : "Latest stories"}
                        </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {articles.map((article) => (
                            <ArticleCard key={article.slug} article={article} locale={resolvedLocale} />
                        ))}
                    </div>
                </section>
            </main>
            <Footer locale={resolvedLocale} />
        </>
    );
}
