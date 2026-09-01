function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function stripHtml(value: string) {
  return value
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<h[1-6][^>]*>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s*#+\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeNepaliText(value: string) {
  return value.replace(
    /Nepal continues to develop rapidly, and the latest reporting around[\s\S]*?reflects the wider public interest in timely, accurate news coverage across the country\.?/gi,
    "नेपालमा पछिल्लो समय सार्वजनिक चासोका विषयमा महत्वपूर्ण घटनाक्रमहरू विकसित भइरहेका छन्। यस समाचारले त्यसैसँग सम्बन्धित नयाँ जानकारी र यसको प्रभावबारे जानकारी दिन्छ।",
  );
}


export function toRichHtml(value: string, locale: "ne" | "en" = "en") {
  const paragraphs = value
    .split(/\n\s*\n/)
    .map((paragraph) => stripHtml(paragraph).trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return locale === "ne"
      ? "<p>नेपालको ताजा समाचार अपडेट।</p>"
      : "<p>Latest Nepal news update.</p>";
  }

  const html = [`<p class="article-lead">${escapeHtml(paragraphs[0])}</p>`];

  for (let i = 1; i < paragraphs.length; i++) {
    html.push(`<p>${escapeHtml(paragraphs[i])}</p>`);
  }

  return html.join("\n");
}

