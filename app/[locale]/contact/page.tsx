import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Mail, MapPin, Globe, Clock } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@/lib/site";

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
        title: isNe ? "हामीलाई सम्पर्क गर्नुहोस् | नेपाली समाचार" : "Contact Us | Nepali Samachar",
        description: isNe
            ? "नेपाली समाचारको टोलीसँग सम्पर्क गर्नुहोस्। सुझाव, प्रश्न वा सहयोगका लागि हामीलाई इमेल गर्नुहोस्।"
            : "Get in touch with the Nepali Samachar team. Send us your feedback, questions, or partnership inquiries.",
        alternates: {
            canonical: `/${isNe ? "ne" : "en"}/contact`,
            languages: {
                ne: "/ne/contact",
                en: "/en/contact",
            },
        },
    };
}

const content = {
    en: {
        title: "Contact Us",
        subtitle: "We'd love to hear from you. Reach out for editorial feedback, corrections, partnership inquiries, or general questions.",
        form: {
            name: "Your Name",
            email: "Your Email Address",
            subject: "Subject",
            message: "Your Message",
            send: "Send Message",
            placeholder: {
                name: "e.g. Ramesh Sharma",
                email: "e.g. ramesh@example.com",
                subject: "e.g. Editorial feedback",
                message: "Write your message here...",
            },
        },
        cards: [
            {
                icon: "mail",
                title: "Email Us",
                detail: "basnetsameer78@gmail.com",
                note: "We aim to reply within 2 business days",
            },
            {
                icon: "location",
                title: "Location",
                detail: "Kathmandu, Nepal",
                note: "Serving readers across Nepal and the world",
            },
            {
                icon: "hours",
                title: "Office Hours",
                detail: "Sunday – Friday",
                note: "9:00 AM – 6:00 PM NST",
            },
            {
                icon: "lang",
                title: "Languages",
                detail: "Nepali & English",
                note: "Bilingual support available",
            },
        ],
        editorial: "Editorial & Corrections",
        editorialBody:
            "If you believe a story contains factual errors or requires a correction, please contact us with full details. We are committed to accuracy and will address legitimate correction requests promptly.",
        ads: "Advertising Inquiries",
        adsBody:
            "For advertising partnerships, sponsored content, or media kit requests, please email us with your company details and campaign goals.",
    },
    ne: {
        title: "सम्पर्क गर्नुहोस्",
        subtitle: "सम्पादकीय प्रतिक्रिया, सुधार, साझेदारी सम्बन्धी जानकारी वा सामान्य प्रश्नका लागि हामीलाई सम्पर्क गर्नुहोस्।",
        form: {
            name: "तपाईंको नाम",
            email: "तपाईंको इमेल ठेगाना",
            subject: "विषय",
            message: "तपाईंको सन्देश",
            send: "सन्देश पठाउनुहोस्",
            placeholder: {
                name: "जस्तै: रमेश शर्मा",
                email: "जस्तै: ramesh@example.com",
                subject: "जस्तै: सम्पादकीय सुझाव",
                message: "यहाँ आफ्नो सन्देश लेख्नुहोस्...",
            },
        },
        cards: [
            {
                icon: "mail",
                title: "इमेल गर्नुहोस्",
                detail: "basnetsameer78@gmail.com",
                note: "हामी २ कार्य दिनभित्र जवाफ दिन प्रयास गर्छौं",
            },
            {
                icon: "location",
                title: "ठेगाना",
                detail: "काठमाडौं, नेपाल",
                note: "नेपाल र विश्वभरका पाठकहरूलाई सेवा",
            },
            {
                icon: "hours",
                title: "कार्यालय समय",
                detail: "आइतबार – शुक्रबार",
                note: "बिहान ९ – साँझ ६ बजे (नेपाल समय)",
            },
            {
                icon: "lang",
                title: "भाषाहरू",
                detail: "नेपाली र अंग्रेजी",
                note: "द्विभाषिक सहयोग उपलब्ध",
            },
        ],
        editorial: "सम्पादकीय तथा सुधार",
        editorialBody:
            "यदि तपाईंलाई लाग्छ कि कुनै समाचारमा तथ्यगत त्रुटि छ वा सुधार आवश्यक छ भने, पूर्ण विवरणसहित हामीलाई सम्पर्क गर्नुहोस्। हामी शुद्धताप्रति प्रतिबद्ध छौं र वैध सुधार अनुरोधलाई तुरुन्त सम्बोधन गर्नेछौं।",
        ads: "विज्ञापन सम्बन्धी जानकारी",
        adsBody:
            "विज्ञापन साझेदारी, प्रायोजित सामग्री, वा मिडिया किट अनुरोधका लागि कृपया आफ्नो कम्पनीको विवरण र अभियानको लक्ष्यसहित हामीलाई इमेल गर्नुहोस्।",
    },
};

const iconMap = {
    mail: Mail,
    location: MapPin,
    hours: Clock,
    lang: Globe,
};

export default async function ContactPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale: Locale = locale === "en" ? "en" : "ne";
    const t = content[resolvedLocale];

    return (
        <>
            <Header locale={resolvedLocale} />
            <main className="container-shell py-12 sm:py-16">
                {/* Page header */}
                <div className="max-w-2xl mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mb-3">
                        {t.title}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
                    {/* LEFT: Contact Form */}
                    <div>
                        <form
                            id="contact-form"
                            action={`mailto:basnetsameer78@gmail.com`}
                            method="get"
                            className="space-y-5"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="contact-name"
                                        className="block text-sm font-semibold text-slate-700 mb-1.5"
                                    >
                                        {t.form.name}
                                    </label>
                                    <input
                                        id="contact-name"
                                        name="name"
                                        type="text"
                                        placeholder={t.form.placeholder.name}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="contact-email"
                                        className="block text-sm font-semibold text-slate-700 mb-1.5"
                                    >
                                        {t.form.email}
                                    </label>
                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        placeholder={t.form.placeholder.email}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="contact-subject"
                                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                                >
                                    {t.form.subject}
                                </label>
                                <input
                                    id="contact-subject"
                                    name="subject"
                                    type="text"
                                    placeholder={t.form.placeholder.subject}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="contact-message"
                                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                                >
                                    {t.form.message}
                                </label>
                                <textarea
                                    id="contact-message"
                                    name="body"
                                    rows={6}
                                    placeholder={t.form.placeholder.message}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition resize-none"
                                />
                            </div>

                            <button
                                id="contact-submit"
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-800 active:scale-95 transition"
                            >
                                <Mail className="h-4 w-4" />
                                {t.form.send}
                            </button>
                        </form>

                        {/* Editorial + Ads sections */}
                        <div className="mt-12 space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <h2 className="text-base font-bold text-slate-900 mb-2">
                                    {t.editorial}
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {t.editorialBody}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <h2 className="text-base font-bold text-slate-900 mb-2">
                                    {t.ads}
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {t.adsBody}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Info Cards */}
                    <div className="space-y-4">
                        {t.cards.map((card) => {
                            const Icon = iconMap[card.icon as keyof typeof iconMap];
                            return (
                                <div
                                    key={card.icon}
                                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                                >
                                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {card.title}
                                        </h3>
                                        <p className="mt-0.5 text-sm font-medium text-slate-700">
                                            {card.detail}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {card.note}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer locale={resolvedLocale} />
        </>
    );
}
