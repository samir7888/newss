import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalPage } from "@/components/legal/LegalPage";
import type { Metadata } from "next";

export function generateStaticParams() {
    return [{ locale: "ne" }, { locale: "en" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isNe = locale !== "en";
    return {
        title: isNe ? "हाम्रो बारेमा | ताजा समाचार" : "About Us | TaajaSamachar",
        description: isNe
            ? "ताजा समाचार नेपालको मौलिक तथा स्वतन्त्र द्विभाषिक डिजिटल पत्रिका हो। हाम्रो सम्पादकीय मिसन र पत्रकारिता मूल्यहरू जान्नुहोस्।"
            : "TaajaSamachar is an independent bilingual digital news publication. Learn about our mission, original reporting, and editorial values.",
    };
}

const aboutContent = {
    en: {
        title: "About Us",
        lastUpdated: "September 2026",
        intro:
            "TaajaSamachar (ताजा समाचार) is an independent bilingual digital news publication dedicated to delivering original, fact-checked, and in-depth reporting to readers in both Nepali and English.",
        sections: [
            {
                heading: "Who We Are",
                body: [
                    "We are an independent digital journalism organisation based in Kathmandu, Nepal. Our newsroom produces original reporting, investigative insights, and bilingual coverage of Nepal's politics, economy, culture, technology, and society.",
                    "We serve readers both within Nepal and across the global Nepali diaspora, maintaining the highest standards of accuracy, balance, and editorial integrity.",
                ],
            },
            {
                heading: "Our Mission",
                body: [
                    "Our mission is to deliver truthful, verified, and accessible journalism that empowers citizens and strengthens democratic discourse. We believe that everyone deserves high-quality, original reporting in both Nepali and English.",
                    "Our journalists produce original stories, verified analysis, and direct reporting. We maintain complete editorial independence and do not publish sensationalized or unverified claims.",
                ],
            },
            {
                heading: "What We Cover",
                body: [
                    "Our newsroom covers key beats across Nepal: Politics & Governance, Economy & Business, Technology & Innovation, Arts & Culture, and Sports.",
                    "Our journalists and editors update our reports continuously throughout the day, ensuring timely, verified, and well-researched news for our readership.",
                ],
            },
            {
                heading: "Original Reporting & Fact-Checking",
                body: [
                    "All stories published on TaajaSamachar are researched, written, and verified by our editorial desk. We conduct primary fact-checking, verify eyewitness accounts, cross-examine official statements, and adhere to rigorous journalistic ethics.",
                    "We take full editorial ownership and responsibility for our content. Every article undergoes strict review for accuracy, impartiality, and fairness before publication.",
                ],
            },
            {
                heading: "Editorial Standards & Ethics",
                body: [
                    "We do not publish misleading, defamatory, or unverified claims. Our editorial process prioritises truth, balance, and accountability.",
                    "We do not accept payment to publish or suppress news stories. Our editorial decisions are made completely independently.",
                    "Corrections Policy: If an error is identified, we promptly investigate and issue transparent corrections. Readers can reach our editorial desk directly through our Contact page.",
                ],
            },
            {
                heading: "Advertising & Revenue",
                body: [
                    "To sustain our free bilingual journalism service, this website displays advertisements, including those served by Google AdSense and other trusted third-party advertising networks.",
                    "Advertising revenue allows us to keep our publication accessible to all readers without paywalls. Advertisers have no influence over our editorial decisions or news coverage.",
                    "All commercial and sponsored placements are clearly distinguished from editorial news content.",
                ],
            },
            {
                heading: "Contact Our Editorial Desk",
                body: [
                    "We welcome reader feedback, tips, corrections, and editorial inquiries. You can contact our newsroom through our Contact page or by emailing basnetsameer78@gmail.com.",
                ],
            },
        ],
    },
    ne: {
        title: "हाम्रो बारेमा",
        lastUpdated: "भाद्र २०८३",
        intro:
            "ताजा समाचार (TaajaSamachar) काठमाडौंमा आधारित एक स्वतन्त्र तथा मौलिक द्विभाषिक डिजिटल समाचार पत्रिका हो। हामी खोजमूलक, तथ्यपरक र निष्पक्ष पत्रकारितामार्फत नेपाली र अंग्रेजी दुवै भाषामा पाठकहरूसमक्ष भरपर्दो समाचार सम्प्रेषण गर्न समर्पित छौं।",
        sections: [
            {
                heading: "हामी को हौं",
                body: [
                    "हामी काठमाडौं, नेपालमा अवस्थित एक स्वतन्त्र डिजिटल पत्रकारिता संस्था हौं। हाम्रो न्यूजरुमले नेपालको राजनीति, अर्थतन्त्र, प्रविधि, संस्कृति तथा समसामयिक विषयहरूमा मौलिक रिपोर्टिङ, खोजमूलक सामग्री र द्विभाषिक समाचार उत्पादन गर्दछ।",
                    "हामी नेपालभित्र र विश्वभर रहेका नेपाली पाठकहरूलाई छिटो, भरपर्दो, तथ्यपरक र सुलभ समाचार सेवा प्रदान गर्दछौं।",
                ],
            },
            {
                heading: "हाम्रो मिसन",
                body: [
                    "हाम्रो मूल उद्देश्य नागरिकहरूलाई सुसूचित बनाउन तथ्यपरक, विश्वसनीय र मौलिक समाचार उपलब्ध गराउनु हो — चाहे नेपाली पढ्ने पाठक हुन् वा अंग्रेजी।",
                    "हाम्रो सम्पादकीय टोली सत्य, निष्पक्षता र पत्रकारिताको मर्यादाप्रति प्रतिबद्ध छ। हामी समाचारलाई अतिरञ्जित वा भ्रामक नबनाई यथार्थ तथ्य प्रस्तुत गर्दछौं।",
                ],
            },
            {
                heading: "हामी के कभर गर्छौं",
                body: [
                    "हाम्रो सम्पादकीय टोलीले नेपालका प्रमुख क्षेत्रहरू — राजनीति तथा सुशासन, अर्थव्यवस्था तथा व्यापार, प्रविधि, कला-संस्कृति र खेलकुद — का विषयमा गहन विश्लेषण र प्रत्यक्ष रिपोर्टिङ गर्दछ।",
                    "हाम्रा पत्रकारहरूले दिनभरका प्रमुख घटनाक्रमलाई नजिकबाट नियालेर समयसापेक्ष, तथ्यपरक र खोजमूलक सामग्रीहरू सम्प्रेषण गर्दछन्।",
                ],
            },
            {
                heading: "मौलिक रिपोर्टिङ तथा सम्पादकीय मापदण्ड",
                body: [
                    "ताजा समाचारमा प्रकाशित हुने सामग्रीहरू हाम्रो आफ्नै सम्पादकीय टोलीद्वारा स्थलगत रिपोर्टिङ, प्रत्यक्ष तथ्य प्रमाणीकरण र गहन अध्ययनका आधारमा तयार पारिएका मौलिक सामग्रीहरू हुन्।",
                    "हामी पत्रकारिताको आचारसंहिता, निष्पक्षता र शुद्धतालाई कडाइका साथ पालना गर्छौं। प्रत्येक सामग्री सम्पादन र प्रमाणीकरण प्रक्रिया पार गरेपछि मात्र प्रकाशित गरिन्छ।",
                ],
            },
            {
                heading: "सम्पादकीय स्वतन्त्रता र आचारसंहिता",
                body: [
                    "हाम्रो सम्पादकीय नीति पूर्ण रूपमा स्वतन्त्र छ। हामी कुनै पनि प्रकारको भ्रामक, मानहानिकारक वा आधारहीन सामग्री प्रकाशित गर्दैनौं।",
                    "हामी समाचार प्रकाशन गर्न वा रोक्न कुनै पनि व्यावसायिक वा राजनीतिक दबाब स्वीकार गर्दैनौं। जनहित र सत्य नै हाम्रो पहिलो प्राथमिकता हो।",
                    "सच्याउने नीति: यदि कुनै सामग्रीमा त्रुटि देखिएमा हामी पारदर्शी ढंगले तुरुन्त सुधार गर्छौं। पाठकहरूले हाम्रो सम्पर्क पृष्ठमार्फत सम्पादकीय टोलीलाई जानकारी गराउन सक्नुहुन्छ।",
                ],
            },
            {
                heading: "विज्ञापन र आम्दानी",
                body: [
                    "हाम्रो निःशुल्क द्विभाषिक पत्रकारिता सेवा दिगो बनाउन यो वेबसाइटले Google AdSense लगायतका विश्वसनीय तेस्रो पक्ष विज्ञापन नेटवर्कद्वारा सेवा गरिएका विज्ञापनहरू प्रदर्शन गर्दछ।",
                    "विज्ञापन आम्दानीले साइटलाई सबै पाठकका लागि निःशुल्क राख्न मद्दत गर्दछ। विज्ञापनदाताहरूले हाम्रा सम्पादकीय निर्णय वा प्रकाशित सामग्रीमा कुनै प्रभाव पार्न सक्दैनन्।",
                    "पाठकहरूले सधैं समाचार सामग्री र विज्ञापन बीच स्पष्ट रूपमा छुट्याउन सकून् भनेर हामी सबै विज्ञापन स्पष्ट रूपमा लेबल गर्दछौं।",
                ],
            },
            {
                heading: "सम्पादकीय टोलीसँग सम्पर्क",
                body: [
                    "हामी तपाईंको प्रतिक्रिया, सुझाव, समाचारका टिप र सम्पादकीय प्रश्नहरूको स्वागत गर्दछौं। तपाईं हाम्रो सम्पर्क पृष्ठमार्फत वा basnetsameer78@gmail.com मा इमेल गरेर हामीसँग सम्पर्क गर्न सक्नुहुन्छ।",
                ],
            },
        ],
    },
} as const;

export default async function AboutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";
    const c = aboutContent[resolvedLocale];

    return (
        <>
            <Header locale={resolvedLocale} />
            <LegalPage
                locale={resolvedLocale}
                title={c.title}
                lastUpdated={c.lastUpdated}
                intro={c.intro}
                sections={c.sections}
            />
            <Footer locale={resolvedLocale} />
        </>
    );
}
