import Link from "next/link";

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
        <main className="container-shell py-10 md:py-14">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <Link href={`/${locale}`} className="text-sm font-medium text-emerald-700 hover:underline">
                        {locale === "ne" ? "होम" : "Home"}
                    </Link>
                </div>

                <header className="mb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {locale === "ne" ? "कानुन र नीति" : "Legal"}
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-3 text-sm text-slate-500">
                        {locale === "ne" ? "अन्तिम अपडेट:" : "Last updated:"} {lastUpdated}
                    </p>
                </header>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <p className="text-base leading-8 text-slate-700">{intro}</p>
                </div>

                <div className="mt-8 space-y-8">
                    {sections.map((section) => (
                        <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-slate-900 md:text-2xl">
                                {section.heading}
                            </h2>
                            <div className="space-y-4 text-base leading-8 text-slate-700">
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
