import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { type NewsArticle } from "@/lib/news-data";
import { categories, type Article, type Locale } from "@/lib/site";
import { formatRelativeTime } from "@/lib/format-date";
import { getCategoryTheme } from "@/lib/category-theme";

interface ArticleCardProps {
  article: Article | NewsArticle;
  locale: Locale;
  layout?: "list-row" | "compact" | "grid-card";
  rank?: number;
}

export function ArticleCard({
  article,
  locale,
  layout = "list-row",
  rank,
}: ArticleCardProps) {
  const title = article.title[locale];
  const excerpt = article.excerpt[locale];
  const category = categories.find((item) => item.slug === article.category);
  const categoryName = category ? category.name[locale] : article.category;
  const theme = getCategoryTheme(article.category);
  const slug =
    locale === "ne" && "slugNe" in article ? article.slugNe : article.slug;
  const timeAgo = formatRelativeTime(article.publishedAt, locale);
  const articleHref = `/${locale}/article/${slug}`;

  // COMPACT SIDEBAR / TRENDING ROW
  if (layout === "compact") {
    return (
      <Link
        href={articleHref}
        className="group flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 transition"
      >
        {typeof rank === "number" && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 font-extrabold text-sm text-slate-500 group-hover:bg-red-700 group-hover:text-white transition">
            {rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-xs ${theme.bg} ${theme.text}`}
            >
              {categoryName}
            </span>
            <span className="text-[11px] text-slate-400">{timeAgo}</span>
          </div>
          <h4 className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-red-700 transition">
            {title}
          </h4>
        </div>
      </Link>
    );
  }

  // GRID CARD (For 3-column related stories or special sections)
  if (layout === "grid-card") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md">
        <Link
          href={articleHref}
          className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
        >
          <Image
            src={article.image}
            alt={article.imageAlt[locale] || title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md ${theme.bg} ${theme.text}`}
            >
              {categoryName}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold leading-snug text-slate-950 line-clamp-2 group-hover:text-red-700 transition">
            <Link href={articleHref}>{title}</Link>
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
          <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
            <span className="font-medium text-slate-500">
              {locale === "ne" ? "सम्पादकीय" : "Editorial Desk"}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // DENSE LIST ROW (SKILL.md §2 Standard for Latest News Feed)
  return (
    <article className="group relative flex flex-row-reverse sm:flex-row items-stretch gap-4 sm:gap-6 py-4 sm:py-5 border-b border-slate-200/80 last:border-0 transition hover:bg-slate-50/70 rounded-lg px-2 -mx-2">
      {/* Content Side */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          {/* Metadata Row: Category Pill + Relative Time + Editorial */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border ${theme.bg} ${theme.text} ${theme.border}`}
            >
              {categoryName}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="h-3 w-3 text-slate-400" />
              {timeAgo}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              {locale === "ne" ? "सम्पादकीय" : "Editorial Desk"}
            </span>
          </div>

          {/* Headline (Main Click Target >= 44px height) */}
          <h3 className="text-base sm:text-xl font-bold leading-snug text-slate-950 group-hover:text-red-700 transition line-clamp-2 sm:line-clamp-2">
            <Link href={articleHref} className="focus:outline-hidden">
              <span className="absolute inset-0" aria-hidden="true" />
              {title}
            </Link>
          </h3>

          {/* Excerpt - Scannable 2 lines */}
          <p className="mt-1.5 hidden sm:line-clamp-2 text-sm text-slate-600 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Mobile Editorial attribution */}
        <div className="mt-2 flex sm:hidden items-center text-[11px] text-slate-400">
          <span>{locale === "ne" ? "सम्पादकीय" : "Editorial Desk"}</span>
        </div>
      </div>

      {/* Image Thumbnail (Fixed Aspect Ratio 4:3 or 16:9) */}
      <Link
        href={articleHref}
        className="relative h-20 w-28 sm:h-28 sm:w-44 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80 block"
      >
        <Image
          src={article.image}
          alt={article.imageAlt[locale] || title}
          fill
          sizes="(max-width: 640px) 112px, 176px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
    </article>
  );
}
