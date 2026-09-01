import { ArticleCard } from "@/components/article/ArticleCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { searchArticles } from "@/lib/news-data";

export default async function SearchPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";
    const query = (await searchParams).q ?? "";
    const results = await searchArticles(query);

    return (
        <>
            <Header locale={resolvedLocale} />
            <main className="container-shell py-10">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{resolvedLocale === "ne" ? "खोज" : "Search"}</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        {resolvedLocale === "ne" ? "समाचार खोज्नुहोस्" : "Search stories"}
                    </h1>
                </div>

                <form method="get" className="mb-8 flex gap-3">
                    <input
                        type="search"
                        name="q"
                        defaultValue={query}
                        placeholder={resolvedLocale === "ne" ? "समाचार खोज्नुहोस्..." : "Search for stories..."}
                        className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-base text-slate-900 outline-none ring-0 focus:border-emerald-400"
                    />
                    <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                        {resolvedLocale === "ne" ? "खोज्नुहोस्" : "Search"}
                    </button>
                </form>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {results.length > 0 ? (
                        results.map((article) => <ArticleCard key={article.slug} article={article} locale={resolvedLocale} />)
                    ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                            {resolvedLocale === "ne" ? "कुनै परिणाम फेला परेन।" : "No stories matched your search."}
                        </div>
                    )}
                </div>
            </main>
            <Footer locale={resolvedLocale} />
        </>
    );
}
