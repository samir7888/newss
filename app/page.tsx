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
};

export default async function Home() {
  return <LocaleHomePage params={Promise.resolve({ locale: "ne" })} />;
}

