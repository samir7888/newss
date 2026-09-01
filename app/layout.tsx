import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ताजा समाचार | Taaja Samachar | Nepal News",
    template: "%s | ताजा समाचार",
  },
  description:
    "ताजा नेपाली समाचार, नेपालका मुख्य खबर, राजनीति, अर्थतन्त्र, खेलकुद, प्रविधि र मनोरञ्जनका विश्वसनीय अपडेट। Latest Nepal news and Nepali samachar in English and Nepali.",
  keywords: [
    "नेपाली समाचार",
    "ताजा समाचार",
    "नेपाल समाचार",
    "आजको समाचार",
    "नेपालको खबर",
    "राजनीतिक समाचार",
    "आर्थिक समाचार",
    "खेलकुद समाचार",
    "प्रविधि समाचार",
    "Nepali samachar",
    "Nepal news",
    "latest Nepal news",
    "breaking news Nepal",
    "today news Nepal",
  ],
  alternates: {
    canonical: "/ne",
    languages: {
      ne: "/ne",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    siteName: "ताजा समाचार | Taaja Samachar",
    title: "ताजा समाचार | Taaja Samachar | Nepal News",
    description:
      "ताजा नेपाली समाचार र नेपालका मुख्य खबरहरू, नेपाली र अंग्रेजी भाषामा।",
    url: siteUrl,
    locale: "ne_NP",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ताजा समाचार | Taaja Samachar",
    description: "ताजा नेपाली समाचार र नेपालका मुख्य खबरहरू।",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ne" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${devanagari.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
