import type { Metadata } from "next";

const locales = ["ne", "en"] as const;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: {
        default: "नेपाली समाचार | Nepali Samachar | ताजा समाचार",
        template: "%s | नेपाली समाचार",
    },
    description: "नेपाली समाचार - ताजा नेपाली समाचार, नेपालका मुख्य खबर र विश्वसनीय समाचार अपडेट।",
    keywords: [
        "नेपाली समाचार",
        "Nepali samachar",
        "NepaliSamachar",
        "ताजा समाचार",
        "नेपाल समाचार",
        "आजको समाचार",
        "Nepal news",
        "latest Nepal news",
    ],
};

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
