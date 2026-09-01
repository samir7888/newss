import type { Metadata } from "next";

const locales = ["ne", "en"] as const;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: {
        default: "Nepal News Pulse",
        template: "%s | Nepal News Pulse",
    },
    description: "Trending Nepal news and analysis in English and Nepali.",
};

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
