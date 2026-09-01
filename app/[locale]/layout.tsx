import type { Metadata } from "next";

const locales = ["ne", "en"] as const;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: {
        default: "ताजा समाचार | Taaja Samachar",
        template: "%s | Taaja Samachar",
    },
    description: "ताजा नेपाली समाचार, नेपालका मुख्य खबर र विश्वसनीय समाचार अपडेट।",
    keywords: [
        "नेपाली समाचार",
        "ताजा समाचार",
        "नेपाल समाचार",
        "आजको समाचार",
        "Nepali samachar",
        "Nepal news",
        "latest Nepal news",
    ],
};

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
