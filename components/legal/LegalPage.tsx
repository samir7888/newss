import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type LegalSection = {
  heading: string;
  body: readonly string[];
};

export function LegalPage({
  locale,
  title,
  lastUpdated,
  intro,
  sections,
}: {
  locale: "ne" | "en";
  title: string;
  lastUpdated: string;
  intro: string;
  sections: readonly LegalSection[];
}) {
  return (
    <main className="container-shell py-8 sm:py-12">
      <div className="mx-auto max-w-[760px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href={`/${locale}`} className="hover:text-red-700 font-medium">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-slate-700 font-semibold">{title}</span>
        </div>

        <header className="mb-8 pb-4 border-b-2 border-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700">
            {locale === "ne" ? "कानुन र नीति" : "Legal Policy"}
          </span>
          <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-950">
            {title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {locale === "ne" ? "अन्तिम अद्यावधिक:" : "Last updated:"} {lastUpdated}
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-medium">
            {intro}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs"
            >
              <h2 className="mb-3 text-lg sm:text-xl font-bold text-slate-950 pb-2 border-b border-slate-100">
                {section.heading}
              </h2>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-600">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.heading}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
