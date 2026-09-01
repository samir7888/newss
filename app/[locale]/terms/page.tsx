import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalPage } from "@/components/legal/LegalPage";

export function generateStaticParams() {
    return [{ locale: "ne" }, { locale: "en" }];
}

const termsContent = {
    en: {
        title: "Terms and Conditions",
        lastUpdated: "August 2026",
        intro:
            "These Terms and Conditions govern access to and use of this website and the services offered through it.",
        sections: [
            {
                heading: "Acceptance of Terms",
                body: [
                    "By accessing or using this website, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.",
                    "If you do not agree with any part of these terms, you must not use this website.",
                ],
            },
            {
                heading: "Use of the Website",
                body: [
                    "You agree to use the website only for lawful purposes and not to interfere with or disrupt the operation of the site or its services.",
                    "You must not upload, post, or transmit malicious content, spam, unlawful material, or content that violates the rights of others.",
                    "We may restrict, suspend, or remove access to any user or content if we believe it violates these terms or creates risk.",
                ],
            },
            {
                heading: "Content and Information",
                body: [
                    "The content on this website is provided for informational and general awareness purposes only.",
                    "We may update, remove, or change content at any time without notice, and we do not guarantee that all information is error-free or always current.",
                    "Any opinions or commentary expressed on the website are not legal, financial, or professional advice unless explicitly stated.",
                ],
            },
            {
                heading: "Intellectual Property",
                body: [
                    "All original content, design, text, graphics, logos, and code created for this website remain our property unless otherwise stated.",
                    "You may not copy, redistribute, republish, or commercially exploit website content without permission.",
                    "Third-party content remains subject to its own rights and licensing terms.",
                ],
            },
            {
                heading: "Links to Third-Party Sites",
                body: [
                    "Our website may contain links to third-party websites or resources. These links are provided for convenience only.",
                    "We do not control and are not responsible for the content, security, or privacy practices of any external site.",
                ],
            },
            {
                heading: "Limitation of Liability",
                body: [
                    "We do not guarantee uninterrupted or error-free access to the website. We are not liable for damages arising from use of the site, including indirect, incidental, or consequential losses.",
                    "To the extent permitted by law, we exclude any warranties not expressly stated in these terms.",
                ],
            },
            {
                heading: "Changes to These Terms",
                body: [
                    "We may revise these Terms and Conditions at any time. Updated terms will take effect once posted on the website.",
                    "Your continued use of the site after changes are posted means you accept the revised terms.",
                ],
            },
            {
                heading: "Termination",
                body: [
                    "We may suspend or terminate access to the website or its services if we believe a user has violated these terms or engaged in abusive, unlawful, or harmful conduct.",
                ],
            },
            {
                heading: "Contact",
                body: [
                    "If you have questions about these Terms and Conditions, contact us through the contact information on the website.",
                ],
            },
        ],
    },
    ne: {
        title: "सर्त र शर्तहरू",
        lastUpdated: "अगस्त २०८३",
        intro:
            "यो सर्त र शर्तहरू वेबसाइटको पहुँच र उपयोगलाई नियन्त्रण गर्छन् र त्यसमा उपलब्ध सेवाहरूको प्रयोगलाई व्यवस्थापन गर्छन्।",
        sections: [
            {
                heading: "सर्तहरू स्वीकार गर्दै",
                body: [
                    "यो वेबसाइट हेर्न वा प्रयोग गर्नुभयो भने, तपाईंले यी सर्त र शर्तहरू र लागू कानुन र नियमहरूसँग सहमत हुनुहुन्छ।",
                    "यदि तपाईं यी सर्तहरूमध्ये कुनै भागसँग सहमत हुनुहुन्न भने, तपाईंले यो वेबसाइट प्रयोग गर्न पाउनुहुन्न।",
                ],
            },
            {
                heading: "वेबसाइटको उपयोग",
                body: [
                    "तपाईं यो वेबसाइटलाई कानूनी उद्देश्यका लागि मात्र प्रयोग गर्न सहमत हुनुहुन्छ र साइटको सञ्चालन वा सेवाहरूमा व्यत्ययपार्न हुँदैन।",
                    "तपाईंले हानिकारक सामग्री, स्प्याम, अवैध सामग्री, वा अरूको अधिकार उल्लङ्घन गर्ने सामग्री अपलोड, पोस्ट, वा प्रसारण गर्न पाउनुहुन्न।",
                    "यदि हामीले मान्यौं भने कुनै प्रयोगकर्ता वा सामग्रीलाई सीमित, निलम्बन, वा हटाउन सक्छौं।",
                ],
            },
            {
                heading: "सामग्री र सूचना",
                body: [
                    "यो वेबसाइटको सामग्री सामान्य जानकारी र जागरूकता उद्देश्यका लागि मात्र उपलब्ध गराइएको छ।",
                    "हामी कुनैपनि समयमा सामग्री परिवर्तन, अपडेट, वा हटाउन सक्छौं र सबै जानकारी सधैं सही वा अद्यावधिक हुन्छ भन्ने ग्यारेन्टी दिन सक्दैनौं।",
                    "वेबसाइटमा व्यक्त गरिएका कुनै राय वा टिप्पणी कानूनी, आर्थिक, वा व्यावसायिक सल्लाह मान्नुपर्दैन, जुन स्पष्ट रूपमा उल्लेख न गरिएको हो।",
                ],
            },
            {
                heading: "बौद्धिक सम्पत्ति",
                body: [
                    "यो वेबसाइटको सबै मूल सामग्री, डिजाइन, पाठ, ग्राफिक्स, लोगो, र कोड हाम्रो स्वामित्वमा रहन्छ।",
                    "तपाईंलाई अनुमति बिना वेबसाइटको सामग्री प्रतिलिपि बनाउने, पुनः वितरण गर्ने, पुनः प्रकाशन गर्ने, वा व्यावसायिक रूपमा प्रयोग गर्ने अधिकार छैन।",
                    "तेस्रो पक्षको सामग्री यसको आफ्नै अधिकार र लाइसेन्स शर्तहरूसँग सम्बन्धित हुन्छ।",
                ],
            },
            {
                heading: "तेस्रो पक्ष वेबसाइट लिंकहरू",
                body: [
                    "हाम्रो वेबसाइटमा तेस्रो पक्ष वेबसाइट वा स्रोतहरूको लिंक हुन सक्छ। यी लिंक केवल सुविधा उद्देश्यका लागि दिइएको छ।",
                    "हामी तेस्रो पक्ष वेबसाइटको सामग्री, सुरक्षा, वा गोपनीयता अभ्यासलाई नियन्त्रण गर्दैनौं र जिम्मेवार पनि छैनौं।",
                ],
            },
            {
                heading: "दायित्वको सीमा",
                body: [
                    "हामी वेबसाइटमा लगातार वा त्रुटिहीन पहुँचको ग्यारेन्टी दिन सक्दैनौं। हामीले साइटको उपयोगबाट उत्पन्न हुने क्षति, जस्तै अप्रत्यक्ष, आकस्मिक, वा परिणामी हानि को लागि जिम्मेवार छैनौं।",
                    "कानूनले अनुमति दिए अनुसार, हामी कुनै कुरा बिना स्पष्ट उल्लेख गरिएका वारंटीहरू बहिष्कर गर्छौं।",
                ],
            },
            {
                heading: "यी सर्तमा परिवर्तन",
                body: [
                    "हामी यी सर्त र शर्तहरू कुनै पनि समयमा संशोधन गर्न सक्छौं। अपडेट गरिएका सर्तहरू वेबसाइटमा पोस्ट गरेपछि प्रभावमा आउनेछन्।",
                    "सर्त परिवर्तन पोस्ट भएपछि वेबसाइटको निरन्तर उपयोगले तपाईंले संशोधित सर्तहरू स्वीकार गर्नुभएको बुझिन्छ।",
                ],
            },
            {
                heading: "समाप्ती",
                body: [
                    "यदि हामीलाई लाग्छ कि कुनै प्रयोगकर्ताले यी सर्तहरू उल्लङ्घन गरेको छ वा अनुचित, अवैध, वा हानिकारक व्यवहार गरेको छ भने, हामी वेबसाइटको पहुँच निलम्बन वा समाप्त गर्न सक्छौं।",
                ],
            },
            {
                heading: "सम्पर्क",
                body: [
                    "यदि यी सर्त र शर्तहरूबारे कुनै प्रश्न छ भने, वेबसाइटमा देखाइएको सम्पर्क जानकारी मार्फत हामीलाई सम्पर्क गर्नुहोस्।",
                ],
            },
        ],
    },
} as const;

export default async function TermsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";
    const content = termsContent[resolvedLocale];

    return (
        <>
            <Header locale={resolvedLocale} />
            <LegalPage
                locale={resolvedLocale}
                title={content.title}
                lastUpdated={content.lastUpdated}
                intro={content.intro}
                sections={content.sections}
            />
            <Footer locale={resolvedLocale} />
        </>
    );
}
