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

function ensureMinimumLength(paragraphs: string[], locale: "ne" | "en") {
  const nepaliAdditions = [
    "यस घटनाक्रमले सम्बन्धित क्षेत्र, स्थानीय समुदाय र समग्र नागरिक जीवनमा पार्ने प्रभावबारे थप चासो र बहस सिर्जना गरेको छ।",
    "सम्बन्धित निकाय, नीति निर्माता र सरोकारवालाहरूले चाल्ने आगामी कदमले यसको दीर्घकालीन दिशा निर्धारण गर्ने देखिन्छ।",
    "विज्ञहरूका अनुसार यस्ता विषयमा समयमै स्पष्ट नीति, चुस्त कार्यान्वयन र पारदर्शिता कायम गर्न सके मात्र अपेक्षित उपलब्धि हासिल हुन सक्छ।",
    "स्थानीय नागरिक तथा सरोकारवालाहरूले पनि सेवा प्रवाह, सूचनाको पहुँच र जवाफदेहितालाई थप प्रभावकारी बनाउन माग गरेका छन्।",
    "विगतका अनुभव र तथ्याङ्कलाई केलाउँदा यस्ता नीतिगत तथा प्रशासनिक निर्णयहरूको समयमै समीक्षा हुनु अपरिहार्य मानिन्छ।",
    "यस निर्णय वा घटनाले दीर्घकालीन रूपमा अर्थतन्त्र, सामाजिक विकास र जनजीविकामा पार्ने बहुआयामिक प्रभावलाई ध्यानमा राख्न जरुरी छ।",
    "सम्बन्धित मन्त्रालय तथा विभागहरूले यस सम्बन्धी थप कार्यविधि र कार्यान्वयन योजना छिट्टै सार्वजनिक गर्ने तयारी गरिरहेका छन्।",
    "नागरिक समाज, उद्योगी व्यवसायी तथा क्षेत्रीय समुदायहरूले पनि यस प्रकारका कदमहरूलाई सकारात्मक रूपमा लिँदै प्रभावकारी कार्यान्वयनमा जोड दिएका छन्।",
    "दीर्घकालीन विकास लक्ष्य हासिल गर्नका लागि स्रोत साधनको समुचित परिचालन र अन्तर-निकाय समन्वयलाई उच्च प्राथमिकता दिनुपर्ने आवश्यकता औंल्याइएको छ।",
    "यस विषयमा थप विवरण, आधिकारिक निर्णय र नयाँ घटनाक्रमहरू आउँदै जाँदा यसको सामाजिक तथा आर्थिक आयाम अझ प्रष्ट हुनेछ।",
    "नेपाल न्यूज पल्सले यस घटनाक्रमका सबै महत्वपूर्ण पक्षहरूलाई निरन्तर पछ्याउँदै ताजा र आधिकारिक सूचना पाठकहरूमाझ प्रस्तुत गरिरहनेछ।",
  ];

  const englishAdditions = [
    "This development carries broader significance for local communities, public services, and policy implementation across Nepal.",
    "Key stakeholders, including institutional authorities and subject matter experts, emphasize that effective follow-through and transparency will be critical going forward.",
    "Analysts note that sustained coordination among responsible bodies will determine the practical impact and long-term outcomes of these measures.",
    "Community representatives have also stressed the importance of accessible public information, accountability, and timely delivery of services.",
    "Looking at past trends and operational data, timely periodic reviews and structured oversight remain essential for tangible success.",
    "The multidimensional impact of this matter on regional economic activity, social well-being, and institutional efficiency is being closely monitored by observers.",
    "Concerned administrative departments and local stakeholders are expected to release updated procedural guidelines and timelines in the coming days.",
    "Civil society groups, private sector participants, and regional representatives have underscored the value of continuous stakeholder consultation.",
    "Achieving targeted developmental milestones will require balanced resource allocation, robust monitoring mechanisms, and clear inter-agency alignment.",
    "As more verified details and official updates emerge, the wider economic and social implications of the situation will become clearer.",
    "Nepal News Pulse will continue tracking subsequent developments closely and provide verified updates with proper source attribution.",
  ];

  const additions = locale === "ne" ? nepaliAdditions : englishAdditions;
  const result = [...paragraphs];
  let index = 0;

  // Ensure robust depth: target at least 1,800 characters and at least 7 paragraphs
  while (
    (result.join(" ").length < 1800 || result.length < 7) &&
    index < additions.length
  ) {
    const addition = additions[index];
    if (!result.includes(addition)) {
      result.push(addition);
    }
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

