import Link from "next/link";
import { Globe, Menu } from "lucide-react";
import { categories, type Locale } from "@/lib/site";

export function Header({ locale, alternateHref }: { locale: Locale; alternateHref?: string }) {
    return (
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
            <div className="container-shell flex items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-3">
                    <button className="md:hidden rounded-full border border-slate-200 p-2" aria-label="Open menu">
                        <Menu className="h-4 w-4" />
                    </button>
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
                            N
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Nepal</div>
                            <div className="text-base font-semibold text-slate-900">News Pulse</div>
                        </div>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
                    {categories.map((category) => (
                        <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className="transition hover:text-slate-900">
                            {locale === "ne" ? category.name.ne : category.name.en}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link href={`/${locale}/search`} className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        <Globe className="h-4 w-4" />
                        Search
                    </Link>
                    <Link
                        href={alternateHref || (locale === "ne" ? "/en" : "/ne")}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                        {locale === "ne" ? "English" : "नेपाली"}
                    </Link>
                </div>
            </div>
        </header>
    );
}
