import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getArticlesByCategory, getCategories } from "@/lib/news-data";

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

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";

    if (!["ne", "en"].includes(resolvedLocale)) notFound();

    const [categories, items] = await Promise.all([
        getCategories(),
        getArticlesByCategory(slug),
    ]);

    const category = categories.find((item) => item.slug === slug);
    if (!category) notFound();

    return (
        <>
            <Header locale={resolvedLocale} />
            <main className="container-shell py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{resolvedLocale === "ne" ? "श्रेणी" : "Category"}</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            {resolvedLocale === "ne" ? category.name.ne : category.name.en}
                        </h1>
                    </div>
                    <Link href={`/${resolvedLocale}`} className="text-sm font-medium text-emerald-700">
                        {resolvedLocale === "ne" ? "होममा फर्कनुहोस्" : "Back to home"}
                    </Link>
                </div>

                {items.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((article) => (
                            <ArticleCard key={article.slug} article={article} locale={resolvedLocale} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                        {resolvedLocale === "ne" ? "यस श्रेणीमा समाचारहरू छैनन्।" : "No stories in this category yet."}
                    </div>
                )}
            </main>
            <Footer locale={resolvedLocale} />
        </>
    );
}
