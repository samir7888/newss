---
name: news-blog-ui-ux
description: UI/UX design guidance for building or restyling a Nepali/English bilingual news website (trending-news blog, ad-monetized, mobile-first). Use this whenever building homepage feeds, article pages, category pages, headers, navigation, or any component for a news/blog site targeting Nepali readers — even if the user just says "make it look good" or "improve the design" rather than asking for UI/UX explicitly. Covers layout patterns, Devanagari + Latin typography pairing, ad-slot placement without hurting readability, image/caption treatment, and mobile-first news UX conventions.
---

# News Blog UI/UX (Nepal, Bilingual, Ad-Supported)

Design lead mindset: this is a **news product**, not a SaaS marketing site or a blog-as-portfolio. The job of every screen is to get a reader from headline to story in the fewest taps, on a mid-range Android phone, on Nepali mobile data — while carrying ads without the page feeling like an ad page. Most AI-generated news UIs default to a generic "magazine card grid" that looks the same for any subject; this brief has specific constraints below that should visibly shape the output.

## 1. Ground rules for this subject

- **Audience:** mostly Nepali readers, mostly on phones, many on 3G/4G, many are not native English speakers even when reading the English locale (so keep English copy plain, not literary).
- **Primary job of the homepage:** scan 15–20 headlines fast and pick one. Not "explore a brand." Optimize for scan speed over visual flourish.
- **Ads live in this layout permanently** — design the grid and spacing assuming ad slots exist from day one, not as something bolted on later. A design that looks great with zero ads and breaks once AdSense units appear is a failed design for this brief.
- **Trust matters more than personality.** News sites earn trust through consistency, clear timestamps, clear sourcing, and restraint — not through bold experimental layouts. Save boldness for one place (see §7), not the whole UI.

## 2. Layout patterns (reference these, don't default to a SaaS card grid)

**Homepage:**
```
┌─────────────────────────────────────┐
│ Header: logo | categories | EN/ने   │  <- sticky, thin, ~56px
├─────────────────────────────────────┤
│ ┌───────────────┐  ┌──────────────┐ │
│ │  LEAD STORY    │  │ 2nd story    │ │  <- one dominant lead
│ │  big image     │  ├──────────────┤ │     (image + large headline),
│ │  large headline│  │ 3rd story    │ │     2–3 secondary stories
│ └───────────────┘  └──────────────┘ │     stacked beside it
├─────────────────────────────────────┤
│ [ad slot — leaderboard, labelled]    │
├─────────────────────────────────────┤
│ Category rail (Politics/राजनीति...)  │  <- horizontal scroll on mobile
├─────────────────────────────────────┤
│ Latest feed: image-left, list rows   │  <- NOT uniform cards; a
│ headline · excerpt · time · category │     dense list scans faster
│ ─────────────────────────────────    │     than a card grid for news
│ (every 6th row: native ad, labelled) │
└─────────────────────────────────────┘
```
Reference real examples of this density: BBC News, Setopati, Kathmandu Post homepages — not Medium or a portfolio blog. A card-grid-of-equal-size-cards (the generic SaaS default) is the wrong pattern for a news homepage; it removes hierarchy between the big story and minor ones.

**Article page:**
```
Category label · time · (EN/ने switch keeps you on same article)
Large headline (own the top of the page — no eyebrow label needed)
Byline / source attribution line: "Based on reporting by [Source] →"
Hero image, full-width, with caption + photo credit directly under it
Body text, max ~65–72 characters per line
  [in-article ad after ~3rd paragraph, clearly boxed/labelled]
Body continues
Related stories (3, image + headline only, at the end)
```

**Category page:** same list pattern as the homepage's "latest feed," filtered, no lead-story treatment (avoid re-using the homepage hero pattern here — it should read as "browsing," not "the front page").

## 3. Typography: Devanagari + Latin pairing

This is the single most distinctive decision on this project — get it right and the site immediately looks considered rather than templated.

- Devanagari (Nepali) and Latin (English) typefaces are **not interchangeable** — a font that looks refined in Latin often renders Devanagari with poor conjunct/matra spacing. Pick each script's typeface independently, then check they share similar weight/contrast so the two locale versions of the site feel like the same brand.
- Suggested pairings (verify licensing before use):
  - Nepali body: **Noto Sans Devanagari** or **Hind** (both designed for screen legibility at small sizes) — do not use a decorative/display Devanagari face for body text.
  - English body: a plain, humanist sans (e.g. **Inter**, **Source Sans**) — avoid a geometric grotesk paired with Devanagari, the contrast in letter construction looks mismatched.
  - Headlines (both locales): it's fine to use a slightly heavier weight of the same body family rather than introducing a third typeface — news sites lean on weight/size contrast, not typeface variety.
- Devanagari script needs **more line-height** than Latin at the same font size (matras and conjuncts need vertical room) — don't reuse one `line-height` token across both locales; give Nepali body text ~1.6–1.7 vs ~1.5 for English.
- Devanagari numerals: use Western numerals (0-9) for dates/times/counts unless the user specifically asks for Devanagari numerals — mixed convention in Nepali digital news is fine, but Western numerals are more common and more legible at small sizes.
- Never auto-shrink Devanagari text to fit a container designed for Latin text — conjuncts become illegible below ~15px on mobile. Set a higher minimum font size for the Nepali locale than the English one if using any fluid/clamp() sizing.

## 4. Color & tone

Avoid the AI-generated-design defaults entirely for this subject — no warm cream + terracotta, no near-black + neon accent, no identical-rounded-card-with-soft-shadow kit. A news site earns distinctiveness from **restraint and clarity**, not from a trendy palette.

- Base: near-white or very light neutral background (not stark #FFFFFF — something like #FAFAF8 reduces eye strain for long reading sessions), near-black text (not pure #000).
- One accent color, used sparingly and consistently for: category tags, the locale switch, active nav state, and links. Pick something that reads as "Nepal news," not generic SaaS blue — consider a color pulled from Nepal's flag (crimson) or a deep marigold, used at low-medium saturation so it doesn't compete with ad creative.
- Category tags can each get a small, muted color-code (politics/sports/entertainment/etc.) — this is one of the few places numbered/labeled taxonomy genuinely helps a returning reader scan faster, so it's justified here (unlike decorative eyebrow labels elsewhere).
- Reserve pure high-saturation color for breaking-news/trending indicators only, so it retains meaning.

## 5. Ad slots: design them in, don't bolt them on

- Every ad slot needs a **reserved fixed height** matching the expected creative size before it loads, so layout doesn't shift (CLS) when the ad renders late on a slow connection — this is both a UX requirement and an AdSense/Core Web Vitals requirement.
- Label ad content clearly ("Advertisement" / "विज्ञापन") — don't style native ad units to visually mimic real article cards; that's both a bad reader experience and against AdSense policy.
- Placement discipline: leaderboard between hero and feed, in-feed native unit every 5–6 list items, one in-article unit after the reader has had a few paragraphs of real content (never above the headline, never before any content). More than this density starts reading as an ad page, which readers and Google both penalize.
- Keep tap targets (headlines, category links) at least 44px tall and with generous spacing from any adjacent ad unit — accidental ad clicks from cramped mobile layouts get sites banned from AdSense.

## 6. Images & captions

- Every article hero image needs a visible caption + photo credit line beneath it (required by stock APIs like Unsplash/Pexels, and it also reads as more credible/professional).
- Use a consistent aspect ratio for feed thumbnails (e.g. 4:3 or 16:9) so list rows don't jump around — pick one and apply it everywhere via `next/image` with explicit width/height.
- On slow connections, the image should not block the headline from rendering — headline and metadata should be readable even if the image is still loading in (use a low-color placeholder/blurhash, not a blank box).

## 7. Where to spend the one bold design decision

Per the "spend your boldness in one place" principle: for this subject, the best candidate is the **lead-story treatment on the homepage** (§2) — a genuinely large, confident headline over a full-width image for the day's top story. Everything else (list rows, category pages, nav) should be quiet, dense, and consistent so the lead story actually reads as important by contrast. Do not also add hover animations on every card, gradient washes, or decorative dividers — those compete with the one moment that should stand out.

## 8. Mobile-first checklist (verify before calling any screen done)

- [ ] Homepage lead story + feed both scan cleanly at 375px width with no horizontal scroll
- [ ] EN/ने locale switch is reachable with one thumb-tap from anywhere, not buried in a menu
- [ ] Devanagari text has its own line-height/min-font-size, not reused Latin values
- [ ] All ad slots have reserved height (no layout shift)
- [ ] Category nav scrolls horizontally on mobile rather than wrapping into a wall of pills
- [ ] Timestamps are relative ("2 hours ago" / "२ घण्टा अगाडि") and localized per active locale
- [ ] Every tap target (headline, category tag, locale switch) ≥ 44px touch area
- [ ] Dark mode is optional for this subject — a news reading surface benefits more from a consistently good light theme than a rushed dark variant; only build dark mode if explicitly requested

## 9. Component checklist (shadcn/ui as base, restyle — don't leave default)

Building on shadcn/ui is fine for structure (Sheet for mobile nav, Tabs for category switching, Skeleton for loading states) but **restyle the default shadcn look** — default shadcn slate/zinc palette and default border-radius on every element is itself a recognizable generic-AI-app tell. Apply the token system from §4 (colors, radius scale, spacing) consistently across every shadcn primitive used, rather than leaving Tailwind/shadcn defaults untouched.
