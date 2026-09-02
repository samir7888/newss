"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Bookmark, BookmarkCheck, Printer, Type, Clock, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/lib/site";

const emptySubscribe = () => () => {};

function getSpeechSynthesisAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

interface ArticleToolbarProps {
  slug: string;
  title: string;
  category: string;
  image: string;
  publishedAt: string;
  source: string;
  readTime: string;
  locale: Locale;
  bodyText?: string;
  onFontSizeChange?: (size: "normal" | "large" | "xlarge") => void;
}

export function ArticleToolbar({
  slug,
  title,
  category,
  image,
  publishedAt,
  source,
  readTime,
  locale,
  bodyText = "",
  onFontSizeChange,
}: ArticleToolbarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false);
  const speechSupported = useSyncExternalStore(
    emptySubscribe,
    getSpeechSynthesisAvailable,
    () => false,
  );

  const t = (ne: string, en: string) => (locale === "ne" ? ne : en);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nepal_news_bookmarks");
      if (saved) {
        const list = JSON.parse(saved);
        setIsBookmarked(list.some((item: { slug: string }) => item.slug === slug));
      }
    } catch {
      // Ignore
    }
  }, [slug]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleBookmark() {
    try {
      const saved = localStorage.getItem("nepal_news_bookmarks");
      let list = saved ? JSON.parse(saved) : [];
      if (isBookmarked) {
        list = list.filter((item: { slug: string }) => item.slug !== slug);
        setIsBookmarked(false);
      } else {
        list.unshift({
          slug,
          title,
          category,
          image,
          publishedAt,
          source,
          savedAt: new Date().toISOString(),
        });
        setIsBookmarked(true);
      }
      localStorage.setItem("nepal_news_bookmarks", JSON.stringify(list));
    } catch {
      // Fallback
    }
  }

  function handleFontSizeToggle() {
    const next =
      fontSize === "normal"
        ? "large"
        : fontSize === "large"
          ? "xlarge"
          : "normal";
    setFontSize(next);
    onFontSizeChange?.(next);
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function pickVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    const prefer = locale === "ne" ? "hi-IN" : "en-US";
    if (locale === "ne") {
      const ne = voices.find((v) => v.lang.toLowerCase().startsWith("ne"));
      const hi = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
      return ne || hi || null;
    }
    const enUS = voices.find((v) => v.lang.toLowerCase() === "en-us");
    const enGB = voices.find((v) => v.lang.toLowerCase() === "en-gb");
    const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    return (
      enUS ||
      enGB ||
      anyEn ||
      voices.find((v) => v.lang.toLowerCase() === prefer) ||
      null
    );
  }

  async function toggleSpeak() {
    if (!speechSupported) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${title}. ${bodyText}`.replace(/\s+/g, " ").trim().slice(0, 5000);
    if (!textToRead) return;

    setIsSpeakingLoading(true);
    window.speechSynthesis.cancel();

    await new Promise((resolve) => {
      let resolved = false;
      const tryResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      };
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener("voiceschanged", tryResolve, { once: true });
        setTimeout(tryResolve, 500);
      } else {
        tryResolve();
      }
    });

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = locale === "ne" ? "hi-IN" : "en-US";
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsSpeakingLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 my-6 rounded-xl border border-slate-200/90 bg-white shadow-2xs text-xs text-slate-600 no-print">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex items-center gap-1.5 text-slate-700">
          <Clock className="h-3.5 w-3.5 text-red-700" />
          <span>{readTime}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Font Size Adjuster */}
        <button
          type="button"
          onClick={handleFontSizeToggle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition active:scale-95"
          title={
            locale === "ne"
              ? "अक्षरको आकार बदल्नुहोस्"
              : "Change font size"
          }
          aria-label="Toggle font size"
        >
          <Type className="h-3.5 w-3.5 text-slate-500" />
          <span>
            {fontSize === "normal"
              ? "अक्षर: सामान्य"
              : fontSize === "large"
                ? "अक्षर: ठूलो"
                : "अक्षर: धेरै ठूलो"}
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          type="button"
          onClick={toggleBookmark}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition active:scale-95 font-semibold ${
            isBookmarked
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-slate-200 hover:bg-slate-50 text-slate-700"
          }`}
          title={
            isBookmarked
              ? locale === "ne"
                ? "सुरक्षित गरिएको छ"
                : "Saved to bookmarks"
              : locale === "ne"
                ? "पछिका लागि सुरक्षित गर्नुहोस्"
                : "Save for later"
          }
          aria-label="Bookmark article"
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="h-3.5 w-3.5 text-red-700" />
              <span>{locale === "ne" ? "सुरक्षित छ" : "Saved"}</span>
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5 text-slate-500" />
              <span>{locale === "ne" ? "सुरक्षित" : "Save"}</span>
            </>
          )}
        </button>

        {/* Listen / Read Aloud Button */}
        {speechSupported && (
          <button
            type="button"
            onClick={toggleSpeak}
            disabled={isSpeakingLoading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition active:scale-95 font-semibold disabled:opacity-60 ${
              isSpeaking
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
            title={
              isSpeaking
                ? t("पढाइ रोक्नुहोस्", "Stop reading aloud")
                : t("समाचार पढेर सुन्नुहोस्", "Listen to this article")
            }
            aria-label="Read article aloud"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-red-700" />
                <span>{t("रोक्नुहोस्", "Stop")}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("सुन्नुहोस्", "Listen")}</span>
              </>
            )}
          </button>
        )}

        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition active:scale-95"
          title={locale === "ne" ? "प्रिन्ट गर्नुहोस्" : "Print article"}
          aria-label="Print article"
        >
          <Printer className="h-3.5 w-3.5 text-slate-500" />
          <span>{locale === "ne" ? "प्रिन्ट" : "Print"}</span>
        </button>
      </div>
    </div>
  );
}
