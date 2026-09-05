"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2, ChevronRight, Newspaper, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Locale } from "@/lib/site";

interface SavedArticle {
  slug: string;
  title: string;
  category: string;
  image: string;
  publishedAt: string;
  source: string;
  savedAt: string;
}

export default function SavedArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const resolvedLocale: Locale = locale === "en" ? "en" : "ne";
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nepal_news_bookmarks");
      if (saved) {
        setSavedArticles(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    setMounted(true);
  }, []);

  function removeBookmark(slug: string) {
    try {
      const updated = savedArticles.filter((item) => item.slug !== slug);
      setSavedArticles(updated);
      localStorage.setItem("nepal_news_bookmarks", JSON.stringify(updated));
    } catch {
      // Fallback
    }
  }

  function clearAll() {
    try {
      localStorage.removeItem("nepal_news_bookmarks");
      setSavedArticles([]);
    } catch {
      // Fallback
    }
  }

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
              {resolvedLocale === "ne" ? "सुरक्षित गरिएका समाचार" : "Saved Articles"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-red-700" />
                <span>
                  {resolvedLocale === "ne" ? "सुरक्षित गरिएका समाचारहरू" : "Saved Stories"}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {resolvedLocale === "ne"
                  ? "तपाईंले पछि पढ्नका लागि सुरक्षित राख्नुभएका सामग्रीहरू"
                  : "Stories you saved locally for offline or later reading"}
              </p>
            </div>

            {savedArticles.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-red-700 hover:text-red-800 hover:underline"
              >
                {resolvedLocale === "ne" ? "सबै हटाउनुहोस्" : "Clear All"}
              </button>
            )}
          </div>

          {!mounted ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {resolvedLocale === "ne" ? "लोड हुँदैछ..." : "Loading saved stories..."}
            </div>
          ) : savedArticles.length > 0 ? (
            <div className="divide-y divide-slate-200/80">
              {savedArticles.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-4 py-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.category} · {resolvedLocale === "ne" ? "सम्पादकीय" : "Editorial Desk"}
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition truncate">
                        <Link href={`/${resolvedLocale}/article/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBookmark(item.slug)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition shrink-0"
                    title={resolvedLocale === "ne" ? "सूचीबाट हटाउनुहोस्" : "Remove"}
                    aria-label="Remove saved story"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
              <Newspaper className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <p className="text-base font-semibold">
                {resolvedLocale === "ne"
                  ? "तपाईंले कुनै समाचार सुरक्षित गर्नुभएको छैन।"
                  : "You have no saved stories yet."}
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {resolvedLocale === "ne"
                  ? "कुनै पनि समाचार पढ्दा 'सुरक्षित' बटन थिचेर यहाँ सुरक्षित गर्न सक्नुहुन्छ।"
                  : "Click the 'Save' button while reading any article to read it later here."}
              </p>
              <Link
                href={`/${resolvedLocale}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{resolvedLocale === "ne" ? "गृहपृष्ठमा जानुहोस्" : "Go to Homepage"}</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer locale={resolvedLocale} />
    </>
  );
}
