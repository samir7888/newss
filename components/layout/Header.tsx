"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Menu, Search, X, TrendingUp, Bookmark } from "lucide-react";
import { categories, type Locale } from "@/lib/site";
import { getTodayFormatted } from "@/lib/format-date";
import { BreakingTicker } from "./BreakingTicker";

interface HeaderProps {
  locale: Locale;
  alternateHref?: string;
  tickerItems?: { slug: string; title: string }[];
}

export function Header({ locale, alternateHref, tickerItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";
  const todayText = getTodayFormatted(locale);

  const switchHref = alternateHref || (locale === "ne" ? "/en" : "/");
  const homeHref = locale === "ne" ? "/" : "/en";
  const isHomeActive = pathname === "/" || pathname === `/${locale}`;

  return (
    <>
      {/* Top Utility & Date Bar */}
      <div className="border-b border-slate-200/80 bg-slate-50/90 text-xs text-slate-600">
        <div className="container-shell flex items-center justify-between py-1.5 gap-3">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <span className="hidden sm:inline-block font-medium text-slate-700 whitespace-nowrap">
              {todayText}
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>

            {/* Dynamic Real Breaking Ticker or Live indicator */}
            {tickerItems && tickerItems.length > 0 ? (
              <BreakingTicker items={tickerItems} locale={locale} />
            ) : (
              <div className="inline-flex items-center gap-1.5 font-semibold text-red-700 whitespace-nowrap">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[11px] uppercase tracking-wider">
                  {locale === "ne" ? "ताजा अपडेट" : "Live News"}
                </span>
              </div>
            )}
          </div>

          {/* Top right quick actions: Search & Saved Stories */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/${locale}/saved`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-red-700 py-1 transition"
              aria-label="Saved Stories"
              title={locale === "ne" ? "सुरक्षित गरिएका समाचार" : "Saved stories"}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">
                {locale === "ne" ? "सुरक्षित" : "Saved"}
              </span>
            </Link>

            <Link
              href={`/${locale}/search`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-red-700 py-1 transition"
              aria-label="Search stories"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden xs:inline text-[11px] font-medium">
                {locale === "ne" ? "खोज्नुहोस्" : "Search"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header (~56px) */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-shadow shadow-xs">
        <div className="container-shell flex h-14 items-center justify-between gap-3">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link
              href={homeHref}
              className="group flex items-center gap-2.5 py-1"
              aria-label="Homepage"
            >
              <Image
                src="/logo.png"
                alt={locale === "ne" ? "नेपाली समाचार" : "Nepali Samachar"}
                width={197}
                height={148}
                priority
                className="h-9 w-auto"
              />
            </Link>
          </div>

          {/* Center: Desktop Categories */}
          <nav
            aria-label="Categories"
            className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-700"
          >
            {categories.map((category) => {
              const href = `/${locale}/category/${category.slug}`;
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={category.slug}
                  href={href}
                  className={`px-3 py-1.5 rounded-full transition text-[13.5px] whitespace-nowrap ${
                    isActive
                      ? "bg-red-50 text-red-800 font-semibold"
                      : "hover:text-red-700 hover:bg-slate-50"
                  }`}
                >
                  {locale === "ne" ? category.name.ne : category.name.en}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Saved, Search & 1-Thumb Reachable Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/${locale}/saved`}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:text-red-700 hover:border-slate-300 transition"
              aria-label="Saved Stories"
              title={locale === "ne" ? "सुरक्षित खबरहरू" : "Saved stories"}
            >
              <Bookmark className="h-4 w-4" />
            </Link>

            <Link
              href={`/${locale}/search`}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:text-red-700 hover:border-slate-300 transition"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            {/* High-visibility EN/ने Locale Switcher (Min 44px touch target) */}
            <Link
              href={switchHref}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 active:scale-95"
              aria-label={
                locale === "ne"
                  ? "Switch to English edition"
                  : "नेपाली संस्करणमा जानुहोस्"
              }
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{locale === "ne" ? "English" : "नेपाली"}</span>
            </Link>
          </div>
        </div>

        {/* Mobile Horizontal Category Rail (Scrollable) */}
        <div className="md:hidden border-t border-slate-100 bg-white px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2">
          <Link
            href={homeHref}
            className={`shrink-0 px-3 py-1 text-xs rounded-full transition font-medium ${
              isHomeActive
                ? "bg-red-700 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Link>
          {categories.map((category) => {
            const href = `/${locale}/category/${category.slug}`;
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={category.slug}
                href={href}
                className={`shrink-0 px-3 py-1 text-xs rounded-full transition font-medium ${
                  isActive
                    ? "bg-red-700 text-white font-semibold shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {locale === "ne" ? category.name.ne : category.name.en}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex w-4/5 max-w-sm flex-col bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt={locale === "ne" ? "नेपाली समाचार" : "Nepali Samachar"}
                  width={197}
                  height={148}
                  className="h-8 w-auto"
                />
                <span className="font-bold text-slate-900 text-base">
                  {locale === "ne" ? "नेपाली समाचार" : "Nepali Samachar"}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              <Link
                href={`/${locale}/search`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 hover:bg-slate-200"
              >
                <Search className="h-4 w-4" />
                <span>{locale === "ne" ? "समाचार खोज्नुहोस्..." : "Search stories..."}</span>
              </Link>

              <Link
                href={`/${locale}/saved`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-red-50 text-red-800 px-4 py-2.5 text-sm font-semibold hover:bg-red-100"
              >
                <Bookmark className="h-4 w-4 text-red-700" />
                <span>{locale === "ne" ? "सुरक्षित गरिएका समाचार" : "Saved Articles"}</span>
              </Link>
            </div>

            <div className="py-2">
              <p className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {locale === "ne" ? "श्रेणीहरू" : "Categories"}
              </p>
              <nav className="flex flex-col space-y-1">
                <Link
                  href={homeHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isHomeActive
                      ? "bg-red-50 text-red-800 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{locale === "ne" ? "गृहपृष्ठ (Home)" : "Home"}</span>
                </Link>
                {categories.map((category) => {
                  const href = `/${locale}/category/${category.slug}`;
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={category.slug}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? "bg-red-50 text-red-800 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        {locale === "ne" ? category.name.ne : category.name.en}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 space-y-3">
              <Link
                href={switchHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Globe className="h-4 w-4" />
                <span>
                  {locale === "ne" ? "Switch to English" : "नेपालीमा पढ्नुहोस्"}
                </span>
              </Link>

              <div className="flex justify-around text-xs text-slate-500 pt-2">
                <Link
                  href={`/${locale}/privacy-policy`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:underline"
                >
                  {locale === "ne" ? "गोपनीयता नीति" : "Privacy Policy"}
                </Link>
                <span>•</span>
                <Link
                  href={`/${locale}/terms`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:underline"
                >
                  {locale === "ne" ? "सर्तहरू" : "Terms"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
