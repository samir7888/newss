"use client";

import { useState } from "react";
import { Check, Copy, Share2, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  label: string;
}

export function ShareButtons({ title, label }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : window.location.href;

  async function copyLink() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="my-8 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-4 bg-slate-50/50 px-4 rounded-xl">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Share2 className="h-4 w-4 text-red-700" />
        <span>{label}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on WhatsApp"
          className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50 active:scale-95 shadow-2xs"
        >
          <MessageCircle className="h-4 w-4 mr-1.5" />
          WhatsApp
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on Facebook"
          className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 active:scale-95 shadow-2xs"
        >
          Facebook
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on X"
          className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 active:scale-95 shadow-2xs"
        >
          X
        </a>

        {/* Copy Link */}
        <button
          type="button"
          onClick={copyLink}
          aria-label={copied ? "Link copied" : "Copy link"}
          className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition active:scale-95 shadow-2xs ${
            copied
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>कपि भयो!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}