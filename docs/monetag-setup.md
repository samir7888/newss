# Monetag Ads — Setup Guide

This guide explains how to create the two ad zones needed for the site and how to configure the environment variables.

> **⚠️ Policy reminder**: Only **Native Banner** and **Standard Banner** zone types are approved for this site.  
> Do **NOT** create Popunder, Interstitial, Vignette Banner, or SmartLink zones — those formats violate Coalition for Better Ads standards and will jeopardise eventual AdSense approval.

---

## Step 1: Create a Monetag account

1. Go to [https://monetag.com](https://monetag.com) and sign up / log in.
2. Add your site URL under **Websites → Add Website** and wait for it to be approved.

---

## Step 2: Create a Native Banner zone

This zone powers the **in-feed** (homepage + category feed) and **leaderboard** (below-hero strip) placements.

1. In the Monetag dashboard go to **Zones → Add Zone**.
2. Choose zone type: **Native Banner**.
3. Give it a name, e.g. `Nepali Samachar — Native Feed`.
4. Copy the **Zone ID** (a numeric string like `1234567`).
5. From the snippet provided, note the **script host** (the domain in the `src` URL, e.g. `ad.push2traffic.com`).

---

## Step 3: Create a Standard Banner zone

This zone powers the **sidebar** (desktop only, 300×250) and **in-article** placements.

1. Go to **Zones → Add Zone** again.
2. Choose zone type: **Banner** (sometimes listed as "Display Banner" or "Standard Banner").
3. Select size **300×250** (Medium Rectangle) for best fill rates.
4. Give it a name, e.g. `Nepali Samachar — Banner 300×250`.
5. Copy the **Zone ID**.

> **Note**: If Monetag's dashboard provides a different script host URL in the Banner snippet vs the Native Banner snippet, use the one from the Native Banner snippet in `NEXT_PUBLIC_MONETAG_SCRIPT_HOST` — both zones use the same host in practice.

---

## Step 4: Fill in environment variables

Open `.env.local` and set:

```env
NEXT_PUBLIC_MONETAG_NATIVE_ZONE_ID=<your native banner zone ID>
NEXT_PUBLIC_MONETAG_BANNER_ZONE_ID=<your standard banner zone ID>
NEXT_PUBLIC_MONETAG_SCRIPT_HOST=<script host from dashboard, e.g. ad.push2traffic.com>
```

**Do not include `https://` in `NEXT_PUBLIC_MONETAG_SCRIPT_HOST`** — the component adds it automatically.

---

## Step 5: Redeploy

```bash
# Locally — restart dev server to pick up the new env vars
npm run dev

# Production — set the three vars in your hosting dashboard (Vercel / Render / etc.)
# then trigger a new deployment
```

---

## How it works in the code

The [`AdSlot` component](../components/ads/AdSlot.tsx) maps each placement to a zone type:

| Variant | Zone type | Env var used |
|---|---|---|
| `leaderboard` | Native Banner | `NEXT_PUBLIC_MONETAG_NATIVE_ZONE_ID` |
| `in-feed` | Native Banner | `NEXT_PUBLIC_MONETAG_NATIVE_ZONE_ID` |
| `in-article` | Standard Banner | `NEXT_PUBLIC_MONETAG_BANNER_ZONE_ID` |
| `sidebar` | Standard Banner | `NEXT_PUBLIC_MONETAG_BANNER_ZONE_ID` |

Scripts are loaded **asynchronously per-component**, not in `<head>`, so pages without ad slots pay zero script-loading cost.

---

## Switching to AdSense later

When AdSense is approved:

1. Fill in the `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and `NEXT_PUBLIC_ADSENSE_SLOT_*` vars.
2. Clear (empty) the three `NEXT_PUBLIC_MONETAG_*` vars.
3. Add the AdSense script tag to your `app/layout.tsx` `<head>` (standard AdSense setup).
4. Redeploy — the `AdSlot` component will automatically serve AdSense units.

---

## Placement map

| Page | Location | Variant | Zone type |
|---|---|---|---|
| Homepage | Below hero, above feed | `leaderboard` | Native Banner |
| Homepage | Every 6th item in feed | `in-feed` | Native Banner |
| Homepage | Desktop sidebar | `sidebar` | Standard Banner (hidden on mobile) |
| Category | Below category header | `leaderboard` | Native Banner |
| Category | Every 5th item in feed | `in-feed` | Native Banner |
| Category | Desktop sidebar | `sidebar` | Standard Banner (hidden on mobile) |
| Article | After body + like button | `in-article` | Standard Banner |
