export type Locale = "ne" | "en";

export type Category = {
  slug: string;
  name: { ne: string; en: string };
};

export type Article = {
  slug: string;
  title: { ne: string; en: string };
  excerpt: { ne: string; en: string };
  body: { ne: string[]; en: string[] };
  category: string;
  image: string;
  imageAlt: { ne: string; en: string };
  publishedAt: string;
  source: string;
  sourceUrl: string;
};

export const categories: Category[] = [
  { slug: "politics", name: { ne: "राजनीति", en: "Politics" } },
  { slug: "economy", name: { ne: "अर्थव्यवस्था", en: "Economy" } },
  { slug: "technology", name: { ne: "प्रविधि", en: "Technology" } },
  { slug: "culture", name: { ne: "संस्कृति", en: "Culture" } },
  { slug: "sports", name: { ne: "खेल", en: "Sports" } },
];

export const articles: Article[] = [
  {
    slug: "nepal-railway-expansion-gains-momentum",
    title: {
      ne: "नेपालमा रेल विस्तारको गति बढ्दै",
      en: "Nepal’s railway expansion gains momentum",
    },
    excerpt: {
      ne: "सड़कको बाहेक रेलसेवा विस्तारले देशभित्र यातायातलाई आधुनिक बनाउँदैछ, जबकि सरकारले कार्यान्वयनमा चासो देखाएको छ।",
      en: "Railway connectivity is expanding across Nepal as the government pushes forward a broader transport upgrade plan.",
    },
    body: {
      ne: [
        "नेपालका अर्थतन्त्र र यातायातको आधारलाई सुदृढ बनाउन रेल विस्तारलाई प्रमुख रणनीति बनाइएको छ। माघ महिनामा सार्वजनिक भएका योजनाले देशका प्रमुख शहरहरू बीचमा सफ्ट, छिटो र सुरक्षित यातायात सुनिश्चित गर्न सहयोग गर्ने अपेक्षा गरिएको छ।",
        "सरकारले हालसालै केन्द्रीय र प्रादेशिक स्तरमा चलाइएको योजना अनुसार, नयाँ लाइन्स, स्टेसन विस्तार र आधुनिक इन्जिनलाई प्राथमिकता दिएको छ। स्थानीय अर्थतन्त्रमा पनि यसले रोजगार सिर्जना र व्यापारको विस्तारमा सकारात्मक प्रभाव पार्ने बुझाइ छ।",
        "सम्भावना रहेकोमा, रेल विस्तारले खेतीपाती, विनिर्माण तथा सेवाक्षेत्रलाई सीधा सहयोग पुर्याउँछ। विद्यमान यातायात प्रणालीमा भार कम भएको र समय बचत हुनेले पेसनामध्ये व्यवसायीहरू र दैनिक यात्रुहरू दुवैले लाभ उठाउने अपेक्षा गरिएको छ।",
        "विकासका लागि आवश्यक क्षमता र सुरक्षाको संयोजन कायम राख्न आवश्यकताका कारण, अधिकारीहरूले परामर्श, सीप विकास र स्टेशन् सुरक्षामा जोड दिएका छन्। यस अघि सञ्चालनमा रहेका सेवा र नयाँ परियोजनाहरू बीच समन्वयलाई महत्व दिइने गरिएको छ।",
      ],
      en: [
        "Nepal is accelerating its railway expansion as part of a wider push to modernize transport and support economic activity across the country. Officials say the new projects aim to reduce travel time, improve reliability, and open up market access between major urban centers.",
        "The government has prioritized new tracks, station upgrades, and service modernization while trying to balance speed with safety and cost. Experts say improved rail connectivity can support agriculture, trade, tourism, and industrial activity by creating more efficient movement of people and goods.",
        "Transport planners also point to the broader regional benefits. When freight and passenger movement are improved, households and businesses gain faster access to markets and services. This is especially relevant for areas where road-based transit remains slow or expensive.",
        "The next phase of implementation will require attention to engineering standards, workforce training, and seamless integration with existing transport networks. The long-term objective is not just expansion but durable, low-cost connectivity that encourages regional growth.",
      ],
    },
    category: "economy",
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
    imageAlt: {
      ne: "रेल लाइन र स्टेशनको चित्र",
      en: "Railway line and station image",
    },
    publishedAt: "2026-08-25T08:15:00.000Z",
    source: "Setopati",
    sourceUrl: "https://www.setopati.com/",
  },
  {
    slug: "tourism-revival-boosts-mountain-regions",
    title: {
      ne: "हिमाली क्षेत्रमा पर्यटन पुनर्स्थापना प्रगति",
      en: "Tourism revival boosts mountain regions",
    },
    excerpt: {
      ne: "स्थानीय समुदाय र पर्यटन उद्योगले नयाँ स्पर्शक र मार्ग विस्तारको साथ क्षेत्रीय आर्थिक जीवनमा सकारात्मक परिवर्तन देखाउँदैछन्।",
      en: "Mountain destinations are seeing renewed activity as tourism operators expand routes and local communities improve visitor services.",
    },
    body: {
      ne: [
        "हिमाली क्षेत्रहरूमा पर्यटन गतिविधि दोब्बर गतिमा बढेको छ। नयाँ ट्र्याकिंग र ट्रेल नेटवर्क, स्थानीय सेवा सुधार, र आतिथ्य क्षेत्रको विस्तारले यात्रुहरूले कम समयमा बढी अनुभव लिने अवसर प्रदान गरिरहेको छ।",
        "सरकार र स्थानीय निकायले पर्यटकीय स्थलहरूको व्यवस्थापन र सुरक्षा मापदण्डलाई मद्दत गर्ने योजनाहरूमा जोड दिइरहेका छन्। यसले यात्रा अनुभवलाई सुरक्षित र गुणस्तरीय बनाउन सहयोग गरेको छ।",
        "स्थानीय व्यवसायवर्गका लागि पनि यो अवसरले रातको बासस्थान, खानपान, हातकडी सेवा र प्रकृतिको सञ्चारलाई विस्तार गरेको छ। इससे लेके उत्पादन, रोजगार र आयमा महत्वपूर्ण सुधार आउने संकेत छ।",
        "विशेषगरी युवा उद्यमीहरूले नयाँ पर्यटन सेवा र डिजिटल विपणनको उपयोग गर्दै स्थानीय अर्थतन्त्रमा सहजीकरण गर्दै छन्।",
      ],
      en: [
        "Tourism in Nepal’s mountain regions is rebounding as new trekking routes, improved visitor services, and local community initiatives attract more travelers. The momentum is especially visible in areas that had been affected by reduced demand and uneven infrastructure investment.",
        "Local operators and municipal authorities are working together to improve transport access, safety standards, and service quality. These changes make destinations more attractive to both domestic and international visitors while helping communities manage seasonal pressure more effectively.",
        "For small businesses, the renewed interest has translated into stronger demand for accommodation, food services, local guides, and cultural experiences. That, in turn, supports household income and local enterprise development across the tourism value chain.",
        "Experts say the next step is to match rising demand with sustainable planning, especially around waste management, trail maintenance, and community benefit-sharing so the sector grows without eroding natural and cultural assets.",
      ],
    },
    category: "culture",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    imageAlt: {
      ne: "हिमाल र यात्रुहरूको दृश्य",
      en: "Mountain landscape with visitors",
    },
    publishedAt: "2026-08-27T10:05:00.000Z",
    source: "Barakhari",
    sourceUrl: "https://www.barakhari.com/",
  },
  {
    slug: "startup-funding-picks-up-in-kathmandu",
    title: {
      ne: "काठमाण्डौमा स्टार्टअप लगानीमा पुनरुत्थान",
      en: "Startup funding picks up in Kathmandu",
    },
    excerpt: {
      ne: "काठमाण्डौंमा प्रारम्भिक चरणको स्टार्टअपलाई सहयोग गर्ने फण्डिङ र सहयोग कार्यक्रम बढ्दै गएपछि उद्यमीहरूले नयाँ आशा लिएर अघि बढिरहेका छन्।",
      en: "Early-stage startup activity in Kathmandu is picking up as investors and accelerator programs look for new digital and service innovations.",
    },
    body: {
      ne: [
        "काठमाण्डौंको उद्यम वातावरणमा नयाँ लगानीको संकेत देखियो। डिजिटल सेवा, कृषि प्रविधि, शहरी सेवा, र शिक्षा प्रविधिमा आधारित स्टार्टअपहरूलाई फण्डिङ र सहयोग कार्यक्रमहरूको विस्तार भएको छ।",
        "सामान्यतया, लगानीकर्ताहरू खतराको साथमा स्केलिङ क्षमता र नीतिगत सहजीकरणलाई हेर्दै आएका छन्। यसले उद्यमीहरूलाई प्रारम्भिक चरणमा बेलायतकै सहयोग र तृतीय पक्षको नेटवर्कमा प्रवेश गराउने अवसर सृजना गरेको छ।",
        "शहरको प्रविधि क्षेत्रमा युवाहरू र प्राविधिक टीमहरू सक्रिय रहेकोले डेटा, एआई, र डिजिटल सेवा सम्बन्धी परियोजनाहरूमा चासो बढिरहेको छ।",
        "विशेषज्ञहरूले यस प्रवृत्तिलाई दीर्घकालीन विकासको आधार मान्दै, सुरक्षात्मक नियम, कर्मचारी क्षमता र मार्केट एक्सपोजरमा जोड दिइनु पर्ने बताउँछन्।",
      ],
      en: [
        "Kathmandu is showing signs of a stronger startup environment as venture interest returns to digital services, agritech, urban solutions, and education technology. A growing number of founders are seeing renewed confidence after a period of cautious capital deployment.",
        "Investors are now looking beyond short-term traction and are weighing scalability, founder quality, and policy support. That shift is helping new businesses access more flexible funding, mentorship, and strategic partnerships.",
        "The city’s technology ecosystem is producing more engineers, product teams, and data-driven founders. This is encouraging a broader mix of startups focused on local problem-solving with digital delivery models.",
        "Analysts say the momentum can be sustained only if the country continues to improve investor readiness, talent development, and market access, while also reducing regulatory friction for new ventures.",
      ],
    },
    category: "technology",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: {
      ne: "उद्यमी र कम्प्यूटरको श्रव्य दृश्य",
      en: "Startup team and computer workspace",
    },
    publishedAt: "2026-08-29T12:00:00.000Z",
    source: "Techpana",
    sourceUrl: "https://techpana.com/",
  },
  {
    slug: "nepal-education-reform-focuses-on-digital-learning",
    title: {
      ne: "शिक्षामा डिजिटल शिक्षणलाई जोड दिई reform",
      en: "Education reform focuses on digital learning",
    },
    excerpt: {
      ne: "शिक्षा क्षेत्रमा डिजिटल साधनहरूको उपयोगलाई प्राथमिकता दिँदै, स्थानीय विद्यालयहरूमा समृद्ध सामग्री र पाठ्यक्रम सुधारको योजना अघि बढाइए।",
      en: "Education officials are prioritizing digital learning tools and curriculum updates as part of a wider reform push in schools.",
    },
    body: {
      ne: [
        "शिक्षामा सुधारको एक प्रमुख भागとして डिजिटल शिक्षणलाई जोड दिइएको छ। विद्यालयहरूले अब पाठ्यक्रमसँग मेल खाने इन्फ्रास्ट्रक्चर, लर्निङ एप, र ऑनलाइन सामग्रीको उपयोग गर्न सक्ने वातावरण तयार गर्दै छन्।",
        "सरकार र शिक्षा निकायहरूले पाठ्यपुस्तक, शिक्षक प्रशिक्षण, र विद्यार्थी-संस्कृति समन्वयलाई ध्यान दिने बताइरहेका छन्। यसले शिक्षा गुणस्तरलाई मात्र नभई, पहुँचलाई पनि विस्तार गर्ने अपेक्षा छ।",
        "दूरदराजका विद्यालयहरूमा इन्टरनेट र उपकरण पहुँचको अभावले चुनौती रहँदै आएको छ। त्यसैले स्थानीय निकाय, सरकारी सहयोग, तथा निजी सहयोगको संयोजन आवश्यक छ।",
        "विशेषज्ञहरूले शिक्षा सुधारको सफलता प्रायः शिक्षक क्षमता, सामग्री गुणवत्ता र विद्यालय व्यवस्थापनमा निर्भर हुन्छ भन्छन्।",
      ],
      en: [
        "A major part of Nepal’s education reform agenda is digital learning. Schools are increasingly adopting digital resources, online lesson material, and curriculum-linked tools that make learning more interactive and measurable.",
        "Education authorities say the shift must be matched by teacher training, content quality, and school-level planning. Without those measures, technology alone cannot improve outcomes.",
        "Remote and under-resourced schools still face major barriers such as unreliable internet access and a lack of devices. Public-private partnerships and local-level support will be essential to close that divide.",
        "Analysts note that the success of reform depends on teacher readiness, curriculum relevance, and the integration of digital resources into classroom practice instead of treating technology as a standalone solution.",
      ],
    },
    category: "politics",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: {
      ne: "कक्षा र डिजिटल शिक्षणको चित्र",
      en: "Classroom and digital learning image",
    },
    publishedAt: "2026-08-30T09:15:00.000Z",
    source: "Online Khabar",
    sourceUrl: "https://www.onlinekhabar.com/",
  },
  {
    slug: "nepal-sports-committee-aims-for-better-facilities",
    title: {
      ne: "खेल सुविधामा सुधारका लागि राष्ट्रिय प्रयास",
      en: "Sports committee pushes for better facilities",
    },
    excerpt: {
      ne: "खेल विकासलाई प्राथमिकता दिने नीति र स्थानीय आयोजनामा सरकार, खेल संघ र समुदायले एकसाथ काम गर्न थालेका छन्।",
      en: "Athletic bodies and local authorities are working together to expand training facilities and improve grassroots sports development.",
    },
    body: {
      ne: [
        "खेलकुद क्षेत्रमा सुधार गर्ने प्रयासहरू स्थानिय तहदेखि राष्ट्रिय स्तरसम्म विस्तार हुँदै गएको छ। अधिकताशा प्रशिक्षण मैदान, जलवायु अनुकूलिए सुविधा, र युवाहरूको पहुँचलाई प्राथमिकता दिईने योजनाहरू तयार भइरहेका छन्।",
        "खेलकुदमा समर्पित प्रशिक्षक, उपकरण, र स्थानीय सहयोग व्यवस्थापनलाई पनि जोड दिइने छ। यसबाट जिल्ला र शहरका युवाहरूलाई प्रतिस्पर्धात्मक अवसर उपलब्ध हुनेछ।",
        "सरकार र खेल संघका प्रतिनिधिहरूले एसडब्ल्यूसीबाट विद्यालय र कम्युनिटी स्तरमा कार्यक्रम संचालन गर्न सहयोग गर्नेमा जोड दिएका छन्।",
        "खेलको सामाजिक प्रभाव पनि महत्वपूर्ण रहन्छ। यसले मानसिक स्वास्थ्य, सामुदायिक सहभागिता र राष्ट्रिय गौरवलाई सहयोग पुर्याउँछ।",
      ],
      en: [
        "Sports development in Nepal is gaining attention as local and national bodies work to improve training grounds, athlete support, and youth participation across regions. The push is increasingly focused on building facilities that are accessible and sustainable.",
        "Training quality, equipment availability, and coach development remain central issues. Without these foundations, talent cannot be nurtured even when interest in sports is high.",
        "Sports associations and local authorities are also looking at school and community-level initiatives, especially to reach young people who might otherwise lack access to structured programs.",
        "The broader impact is significant: better facilities and participation can strengthen community wellbeing, social cohesion, and national sporting performance over time.",
      ],
    },
    category: "sports",
    image:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    imageAlt: {
      ne: "खेल मैदान र प्रशिक्षकको दृश्य",
      en: "Sports field and athlete training image",
    },
    publishedAt: "2026-08-31T07:20:00.000Z",
    source: "Ratopati",
    sourceUrl: "https://ratopati.com/",
  },
];

export function getLocaleLabel(locale: Locale) {
  return locale === "ne" ? "नेपाली" : "English";
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug) ?? null;
}

export function getArticlesByCategory(categorySlug: string) {
  return articles.filter((article) => article.category === categorySlug);
}

export function searchArticles(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return articles;

  return articles.filter((article) => {
    const haystack = [
      article.title.ne,
      article.title.en,
      article.excerpt.ne,
      article.excerpt.en,
      article.category,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
