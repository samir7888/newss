"use client";

import { useState } from "react";
import { ArticleToolbar } from "./ArticleToolbar";
import type { Locale } from "@/lib/site";

interface ArticleReaderProps {
  slug: string;
  title: string;
  category: string;
  image: string;
  publishedAt: string;
  source: string;
  readTime: string;
  bodyHtml: string;
  locale: Locale;
}

export function ArticleReader({
  slug,
  title,
  category,
  image,
  publishedAt,
  source,
  readTime,
  bodyHtml,
  locale,
}: ArticleReaderProps) {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  const fontClassMap = {
    normal: "text-base sm:text-[1.125rem]",
    large: "text-lg sm:text-[1.25rem] leading-[1.85]",
    xlarge: "text-xl sm:text-[1.38rem] leading-[1.95]",
  };

  return (
    <div>
      {/* Interactive Toolbar */}
      <ArticleToolbar
        slug={slug}
        title={title}
        category={category}
        image={image}
        publishedAt={publishedAt}
        source={source}
        readTime={readTime}
        locale={locale}
        onFontSizeChange={(size) => setFontSize(size)}
      />

      {/* Article Body with dynamic font size */}
      <div
        className={`article-body rounded-2xl bg-white p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-xs transition-all duration-200 ${fontClassMap[fontSize]}`}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </div>
  );
}
