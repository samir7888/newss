import Link from "next/link";
import type { Locale } from "@/lib/site";

export function Footer({ locale = "ne" }: { locale?: Locale }) {
    return (
        <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-200">
            <div className="container-shell flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-lg font-semibold">Nepal News Pulse</div>
                    <p className="mt-1 text-sm text-slate-400">
                        {locale === "ne" ? "नेपालका छिटो समाचारका लागि द्विभाषिक कभरेज" : "Bilingual reporting for Nepal’s fast-moving stories."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                    <Link href={`/${locale}/privacy-policy`} className="transition hover:text-white">
                        {locale === "ne" ? "गोपनीयता नीति" : "Privacy Policy"}
                    </Link>
                    <Link href={`/${locale}/terms`} className="transition hover:text-white">
                        {locale === "ne" ? "सर्त र शर्तहरू" : "Terms & Conditions"}
                    </Link>
                    <span className="text-slate-500">Advertise</span>
                    <span className="text-slate-500">Contact</span>
                </div>
            </div>
        </footer>
    );
}
