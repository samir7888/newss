import Link from "next/link";
import { categories, type Locale } from "@/lib/site";
import { Globe, ShieldCheck } from "lucide-react";

export function Footer({ locale = "ne" }: { locale?: Locale }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#0B1120] text-slate-300">
      <div className="container-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white font-extrabold text-lg">
                ता
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {locale === "ne" ? "ताजा समाचार" : "Nepal News Pulse"}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-md">
              {locale === "ne"
                ? "नेपालका ताजा, विश्वसनीय र महत्त्वपूर्ण खबरहरूको द्विभाषिक डिजिटल पत्रिका। राजनीति, अर्थतन्त्र, प्रविधि, खेलकुद तथा समसामयिक घटनाक्रमहरूको तीव्र अपडेट।"
                : "Fast, verified, and comprehensive bilingual digital reporting on Nepal's politics, economy, technology, culture, and sports."}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                {locale === "ne"
                  ? "तथ्यपरक र स्रोत खुलाइएको समाचार संकलन"
                  : "Verified journalism aggregation & sourcing"}
              </span>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              {locale === "ne" ? "श्रेणीहरू" : "News Categories"}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/category/${cat.slug}`}
                  className="text-slate-300 hover:text-red-400 transition py-1"
                >
                  {locale === "ne" ? cat.name.ne : cat.name.en}
                </Link>
              ))}
              <Link
                href={`/${locale}/search`}
                className="text-slate-300 hover:text-red-400 transition py-1"
              >
                {locale === "ne" ? "समाचार खोज्नुहोस्" : "Search News"}
              </Link>
            </div>
          </div>

          {/* Legal & Info Col */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              {locale === "ne" ? "जानकारी तथा कानुनी" : "Information & Legal"}
            </h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href={`/${locale}/privacy-policy`}
                className="text-slate-300 hover:text-white transition"
              >
                {locale === "ne" ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy"}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-slate-300 hover:text-white transition"
              >
                {locale === "ne" ? "नियम तथा सर्तहरू (Terms & Conditions)" : "Terms & Conditions"}
              </Link>
              <Link
                href={locale === "ne" ? "/en" : "/ne"}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition pt-1 text-xs"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{locale === "ne" ? "Read in English" : "नेपालीमा पढ्नुहोस्"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} {locale === "ne" ? "ताजा समाचार" : "Nepal News Pulse"}.{" "}
            {locale === "ne" ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <span>Nepal · Kathmandu</span>
            <span>•</span>
            <span className="text-slate-400">Bilingual Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
