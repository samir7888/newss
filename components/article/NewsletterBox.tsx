"use client";

import { useState } from "react";
import { Mail, CheckCircle2, BellRing } from "lucide-react";
import type { Locale } from "@/lib/site";

export function NewsletterBox({ locale = "ne" }: { locale?: Locale }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <div className="rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/60 via-white to-amber-50/40 p-5 shadow-xs">
      <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1.5">
        <BellRing className="h-4 w-4" />
        <span>{locale === "ne" ? "दैनिक मुख्य खबर बुलेटिन" : "Daily News Digest"}</span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {locale === "ne"
          ? "नेपालका महत्त्वपूर्ण खबरहरू हरेक बिहान आफ्नो इमेलमा प्राप्त गर्नुहोस्।"
          : "Get the day's top Nepal headlines delivered directly to your inbox every morning."}
      </p>

      {subscribed ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            {locale === "ne"
              ? "धन्यवाद! तपाईंको सदस्यता सफल भयो।"
              : "Thank you! You are now subscribed."}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                locale === "ne"
                  ? "तपाईंको इमेल ठेगाना..."
                  : "Your email address..."
              }
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs text-slate-900 shadow-2xs outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-red-700 hover:bg-red-800 py-2.5 text-xs font-bold text-white transition active:scale-98 shadow-xs"
          >
            {locale === "ne" ? "निःशुल्क सदस्यता लिनुहोस्" : "Subscribe for Free"}
          </button>
        </form>
      )}
    </div>
  );
}
