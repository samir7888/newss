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
    .replace(/Context and implications|What happens next/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeNepaliText(value: string) {
  return value.replace(
    /Nepal continues to develop rapidly, and the latest reporting around[\s\S]*?reflects the wider public interest in timely, accurate news coverage across the country\.?/gi,
    "नेपालमा पछिल्लो समय सार्वजनिक चासोका विषयमा महत्वपूर्ण घटनाक्रमहरू विकसित भइरहेका छन्। यस समाचारले त्यसैसँग सम्बन्धित नयाँ जानकारी र यसको प्रभावबारे जानकारी दिन्छ।",
  );
}

function ensureMinimumLength(paragraphs: string[], locale: "ne" | "en") {
  const additions =
    locale === "ne"
      ? [
          "यस विषयको प्रभाव स्थानीय समुदाय, सार्वजनिक सेवा र दैनिक जीवनसँग पनि जोडिएको छ।",
          "सम्बन्धित निकायबाट आउने निर्णय र कार्यान्वयनले आगामी अवस्थालाई निर्धारण गर्नेछ।",
          "पुष्टि भएका नयाँ विवरणहरू सार्वजनिक हुँदै जाँदा पाठकले घटनाको व्यापक सन्दर्भ बुझ्न सक्नेछन्।",
        ]
      : [
          "The development also affects local communities, public services, and the way people experience everyday life.",
          "Decisions by responsible institutions and their implementation will shape what happens next.",
          "As verified details emerge, readers will be able to understand the wider context and practical impact of the story.",
        ];
  const result = [...paragraphs];
  let index = 0;
  while (result.join(" ").length < 500) {
    result.push(additions[index % additions.length]);
    index += 1;
  }
  return result;
}

export function toRichHtml(value: string, locale: "ne" | "en" = "en") {
  const paragraphs = ensureMinimumLength(
    value
      .split(/\n\s*\n/)
      .map((paragraph) => stripHtml(paragraph).trim())
      .filter(Boolean),
    locale,
  );

  if (paragraphs.length === 0) return "<p>Latest Nepal news update.</p>";

  const html = [`<p class="article-lead">${escapeHtml(paragraphs[0])}</p>`];

  if (paragraphs[1]) {
    html.push(`<p>${escapeHtml(paragraphs[1])}</p>`);
  }

  if (paragraphs.length > 2) {
    // Determine where to place section headers based on total length
    const midPoint = Math.min(
      2 + Math.ceil((paragraphs.length - 2) * 0.6),
      paragraphs.length,
    );

    html.push(
      `<h2>${locale === "ne" ? "सन्दर्भ र प्रभाव" : "Context and implications"}</h2>`,
    );
    html.push(
      ...paragraphs
        .slice(2, midPoint)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    );

    // Add second section header for remaining paragraphs if there are enough
    if (midPoint < paragraphs.length) {
      html.push(
        `<h2>${locale === "ne" ? "अब के हुन्छ" : "What happens next"}</h2>`,
      );
      html.push(
        ...paragraphs
          .slice(midPoint)
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
      );
    }
  }

  return html.join("\n");
}
