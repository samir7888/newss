import type { Metadata } from "next";
import LocaleHomePage from "./[locale]/page";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      ne: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  // Monetag site verification — explicitly on the bare "/" route
  other: {
    monetag: "f6720141114fecac57fb496abcd38a14",
  },
};

export default async function Home() {
  return <LocaleHomePage params={Promise.resolve({ locale: "ne" })} />;
}

