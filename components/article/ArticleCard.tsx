import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type NewsArticle } from "@/lib/news-data";
import { categories, type Article, type Locale } from "@/lib/site";

export function ArticleCard({ article, locale }: { article: Article | NewsArticle; locale: Locale }) {
    const title = article.title[locale];
    const excerpt = article.excerpt[locale];
    const category = categories.find((item) => item.slug === article.category);
    const slug = locale === "ne" && "slugNe" in article ? article.slugNe : article.slug;

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <Image src={article.image} alt={article.imageAlt[locale]} fill className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-5">
                <div className="mb-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {category ? category.name[locale] : article.category}
                </div>
                <h3 className="line-clamp-3 min-h-18 text-xl font-semibold leading-snug text-slate-900">{title}</h3>
                <p className="mt-3 line-clamp-3 min-h-18 text-sm leading-6 text-slate-600">{excerpt}</p>
                <div className="mt-5 flex min-h-9 items-center justify-between gap-3">
                    
                    <Link href={`/${locale}/article/${slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                        Read more <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
