import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalPage } from "@/components/legal/LegalPage";

export function generateStaticParams() {
    return [{ locale: "ne" }, { locale: "en" }];
}

const privacyContent = {
    en: {
        title: "Privacy Policy",
        lastUpdated: "August 2026",
        intro:
            "This Privacy Policy explains how we collect, use, and protect information when you visit our website and use our services.",
        sections: [
            {
                heading: "Information We Collect",
                body: [
                    "We may collect basic information such as browser type, device information, country, access time, pages viewed, and referring websites.",
                    "We also collect information you provide directly, such as comments, contact messages, newsletters, or account-related details when applicable.",
                    "We do not sell your personal data. We use it to operate, secure, and improve the service.",
                ],
            },
            {
                heading: "How We Use Information",
                body: [
                    "We use this information to understand site traffic, improve content quality, detect technical issues, and maintain service reliability.",
                    "We may use aggregated analytics to monitor trends, evaluate user experience, and improve our reporting.",
                    "If you contact us, we may use the information you share to respond to your message or request.",
                ],
            },
            {
                heading: "Cookies and Analytics",
                body: [
                    "We may use cookies, local storage, or analytics tools to understand usage patterns and improve website performance.",
                    "These tools may log general information such as visited pages, device type, browser version, and approximate location.",
                    "You may disable cookies in your browser settings, though some features may become limited.",
                ],
            },
            {
                heading: "Third-Party Services",
                body: [
                    "We may use third-party services for hosting, analytics, or social sharing. These providers may process data according to their own privacy practices.",
                    "We choose providers carefully and only share the information necessary to deliver the service.",
                    "This policy does not cover third-party websites, external links, or embedded content beyond our direct control.",
                ],
            },
            {
                heading: "Data Security",
                body: [
                    "We apply reasonable technical and administrative safeguards to protect personal information from unauthorised access, misuse, or disclosure.",
                    "No system is completely risk-free, so we cannot guarantee absolute security. We continue to improve our protections as technology and risks evolve.",
                ],
            },
            {
                heading: "Your Rights",
                body: [
                    "Depending on your jurisdiction, you may have rights to request access, correction, deletion, or restriction of your personal information.",
                    "If you wish to exercise any rights concerning data we hold, please contact us through the channels listed on the website.",
                    "We may need to verify your request before processing it.",
                ],
            },
            {
                heading: "Children’s Privacy",
                body: [
                    "Our service is not intended for children under the age required by applicable law, and we do not knowingly collect personal information from children without appropriate consent.",
                    "If we become aware that we have collected personal information from a child without valid consent, we will take reasonable steps to remove it.",
                ],
            },
            {
                heading: "Changes to This Policy",
                body: [
                    "We may update this Privacy Policy from time to time to reflect changes in technology, legal requirements, or service operations.",
                    "When major changes are made, we will update the date shown at the top of this page and may post a notice on the website.",
                ],
            },
            {
                heading: "Advertising and Google AdSense",
                body: [
                    "This website uses Google AdSense, a web advertising service provided by Google LLC. Google AdSense uses cookies and similar tracking technologies to serve personalised advertisements based on your prior visits to this website and other websites on the internet.",
                    "Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our website and/or other websites on the internet. You may opt out of personalised advertising by visiting Google's Ad Settings page at https://adssettings.google.com.",
                    "Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits. The use of advertising cookies by Google is subject to Google's Privacy Policy at https://policies.google.com/privacy and the DoubleClick cookie policy at https://policies.google.com/technologies/ads.",
                    "We do not have access to or control over cookies that are used by third-party advertisers. You may disable cookies through your browser settings, which will opt you out of personalised advertising.",
                ],
            },
            {
                heading: "Contact",
                body: [
                    "If you have questions about this policy or how we handle your data, please contact us using the contact information displayed on the website.",
                ],
            },
        ],
    },
    ne: {
        title: "गोपनीयता नीति",
        lastUpdated: "अगस्त २०८३",
        intro:
            "यो गोपनीयता नीति बताउँछ कि हामी वेबसाइट हेर्दा र सेवाहरू प्रयोग गर्दा तपाईंको जानकारी कसरी सङ्कलन, प्रयोग र सुरक्षित राख्छौं।",
        sections: [
            {
                heading: "हामी के जानकारी सङ्कलन गर्छौं",
                body: [
                    "हामीले सामान्य जानकारी जस्तै ब्राउजर प्रकार, डिभाइस जानकारी, देश, पहुँच समय, हेरेको पृष्ठ, र रेफरिङ वेबसाइट जस्ता घटकहरू सङ्कलन गर्न सक्छौं।",
                    "तपाईंले प्रत्यक्ष प्रदान गर्ने टिप्पणी, सम्पर्क सन्देश, न्यूज़लेटर, वा आवश्यक भए खातासम्बन्धी विवरण पनि सङ्कलन गर्न सकिन्छ।",
                    "हामी तपाईंको व्यक्तिगत जानकारी बेच्दैनौं। हामीले यसलाई सेवा सञ्चालन, सुरक्षा, र सुधारका लागि मात्र प्रयोग गर्छौं।",
                ],
            },
            {
                heading: "हामी जानकारी कसरी प्रयोग गर्छौं",
                body: [
                    "हामी सङ्कलित जानकारी प्रयोग गरेर साइटको ट्राफिक बुझ्न, सामग्रीको गुणस्तर सुधार्न, प्राविधिक समस्याहरू पत्ता लगाउन, र सेवा स्थिरतासम्बन्धी सुधार गर्न सक्छौं।",
                    "हामी समग्र विश्लेषण प्रयोग गरेर उपयोगको धारा, अनुभव, र सामग्री सुधारका लागि मापन गर्छौं।",
                    "यदि तपाईंले हामीलाई सम्पर्क गर्नुभयो भने, तपाईंले दिएको जानकारी उत्तर या अनुरोधको लागि प्रयोग गर्न सकिन्छ।",
                ],
            },
            {
                heading: "कुंजी र विश्लेषण",
                body: [
                    "हामीले उपयोगको पैटर्न बुझ्न, सेवा सुधार गर्न र प्रदर्शन बढाउन कुंजी, लोकल स्टोरेज, वा विश्लेषण उपकरणहरू प्रयोग गर्न सक्छौं।",
                    "यी उपकरणहरूले सामान्य जानकारी जस्तै हेरेको पृष्ठ, डिभाइस प्रकार, ब्राउजर संस्करण, र अनुमानित स्थान रेकर्ड गर्न सक्छन्।",
                    "तपाईंले ब्राउजर सेटिङमा कुंजी बन्द गर्न सक्नुहुन्छ, यद्यपि केही सुविधाहरू सीमित हुन सक्छ।",
                ],
            },
            {
                heading: "तेस्रो पक्ष सेवाहरू",
                body: [
                    "हामी होस्टिङ, विश्लेषण, वा सामाजिक साझेदारीका लागि तेस्रो पक्ष सेवाहरू प्रयोग गर्न सक्छौं। यी प्रदाताहरूले आफ्नै गोपनीयता नीतिका अनुसार जानकारी प्रशोधन गर्न सक्छन्।",
                    "हामी केवल सेवाको लागि आवश्यक सूचना तेस्रो पक्षलाई साझेदारी गर्छौं।",
                    "यो नीति तेस्रो पक्ष वेबसाइट, बाह्य लिङ्क, वा हाम्रो प्रत्यक्ष नियन्त्रणभन्दा बाहिर रहेका एम्बेडेड सामग्रीलाई समेट्दैन।",
                ],
            },
            {
                heading: "डाटा सुरक्षा",
                body: [
                    "हामीले व्यक्तिगत जानकारीलाई अनधिकृत पहुँच, दुरुपयोग, वा खुलासा बिना सुरक्षित राख्न तर्कयुक्त प्राविधिक र प्रशासनिक उपायहरू लागू गर्छौं।",
                    "कुनै पनि प्रणाली पूर्ण सुरक्षित छैन, त्यसैले पूर्ण सुरक्षाको ग्यारेन्टी दिन सकिदैन। हामी प्रविधि र जोखिम परिवर्तनसँगै सुरक्षालाई निरन्तर सुधार गर्छौं।",
                ],
            },
            {
                heading: "तपाईंको अधिकार",
                body: [
                    "तपाईंको क्षेत्रिय कानून अनुसार, तपाईंले आफ्नो व्यक्तिगत जानकारीको पहुँच, सुधार, मेटाउन, वा सीमित गर्नको लागि अनुरोध गर्ने अधिकार हुन सक्छ।",
                    "यदि तपाईंले कुनै अधिकार प्रयोग गर्न चाहनुहुन्छ भने, कृपया वेबसाइटमा देखाइएको सम्पर्क माध्यममार्फत हामीलाई सम्पर्क गर्नुहोस्।",
                    "हामीले अनुरोध प्रक्रिया गर्नुअघि तपाईंको पहिचान प्रमाणित गर्न आवश्यक हुन सक्छ।",
                ],
            },
            {
                heading: "बालबालिकाको गोपनीयता",
                body: [
                    "हाम्रो सेवा लागू कानुनमा आवश्यक उमेरभन्दा कम उमेरका बच्चाहरूका लागि होइन, र हामी उचित सहमति बिना बालबालिकाको व्यक्तिगत जानकारी knowingly सङ्कलन गर्दैनौं।",
                    "यदि हामीलाई थाहा भए कि हामीले सही सहमति बिना बच्चाको जानकारी सङ्कलन गरेका छौं भने, हामी उचित कदम उठाउनेछौं।",
                ],
            },
            {
                heading: "यो नीतिमा परिवर्तन",
                body: [
                    "हामीले प्राविधिकी, कानूनी आवश्यकताहरू, वा सेवा सञ्चालनमा परिवर्तन हुँदा यो गोपनीयता नीति अपडेट गर्न सक्छौं।",
                    "महत्वपूर्ण परिवर्तन हुँदा हामी पृष्ठको शीर्षमा रहेको मिति अपडेट गर्छौं र वेबसाइटमा सूचना पोस्ट गर्न सक्दछौं।",
                ],
            },
            {
                heading: "विज्ञापन र Google AdSense",
                body: [
                    "यो वेबसाइट Google LLC द्वारा प्रदान गरिएको वेब विज्ञापन सेवा Google AdSense प्रयोग गर्दछ। Google AdSense ले यो वेबसाइट र इन्टरनेटका अन्य वेबसाइटमा तपाईंको अघिल्लो भ्रमणका आधारमा व्यक्तिगत विज्ञापनहरू प्रस्तुत गर्न कुकी र समान ट्र्याकिङ प्रविधिहरू प्रयोग गर्दछ।",
                    "Google को विज्ञापन कुकी प्रयोगले यसलाई र यसका साझेदारहरूलाई हाम्रो वेबसाइट र/वा इन्टरनेटका अन्य वेबसाइटमा तपाईंको भ्रमणका आधारमा विज्ञापन देखाउन सक्षम बनाउँछ। तपाईं Google को Ad Settings पृष्ठ https://adssettings.google.com मा गएर व्यक्तिगत विज्ञापनबाट अप्ट-आउट गर्न सक्नुहुन्छ।",
                    "Google सहित तेस्रो-पक्ष विक्रेताहरूले प्रयोगकर्ताको अघिल्लो भ्रमणका आधारमा विज्ञापन दिन कुकी प्रयोग गर्दछन्। Google द्वारा विज्ञापन कुकी प्रयोग Google को गोपनीयता नीति https://policies.google.com/privacy र DoubleClick कुकी नीति https://policies.google.com/technologies/ads अनुसार हुन्छ।",
                    "हामीसँग तेस्रो-पक्ष विज्ञापनदाताहरूले प्रयोग गर्ने कुकीहरूमा पहुँच वा नियन्त्रण छैन। तपाईं ब्राउजर सेटिङमार्फत कुकी निष्क्रिय गरेर व्यक्तिगत विज्ञापनबाट अप्ट-आउट गर्न सक्नुहुन्छ।",
                ],
            },
            {
                heading: "सम्पर्क",
                body: [
                    "यदि यस नीति वा डाटा हेरचाहबारे कुनै प्रश्न छ भने, कृपया वेबसाइटमा प्रदर्शित सम्पर्क जानकारी मार्फत हामीलाई सम्पर्क गर्नुहोस्।",
                ],
            },
        ],
    },
} as const;

export default async function PrivacyPolicyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "ne";
    const content = privacyContent[resolvedLocale];

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
