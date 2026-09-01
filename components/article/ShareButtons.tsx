"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title, label }: { title: string; label: string }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window === "undefined" ? "" : window.location.href;

    async function copyLink() {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-slate-200 py-5">
            <span className="mr-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Share2 className="h-4 w-4 text-emerald-700" />
                {label}
            </span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700">
                <span className="text-sm font-bold">f</span>
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700">
                <span className="text-xs font-bold">in</span>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700">
                X
            </a>
            <button type="button" onClick={copyLink} aria-label={copied ? "Link copied" : "Copy link"} className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy link"}
            </button>
        </div>
    );
}