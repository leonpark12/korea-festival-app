import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, Noto_Sans_KR } from "next/font/google";
import type { Metadata, Viewport } from "next";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#003049",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === "ko";

  return {
    title: {
      template: "%s | Tour Korea",
      default: "Tour Korea",
    },
    description: isKo
      ? "지도에서 한국의 관광지, 맛집, 숙박, 쇼핑 명소를 탐색하세요"
      : "Explore Korea's best attractions, restaurants, accommodations, and more on an interactive map",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ko: "/ko",
        en: "/en",
      },
    },
    openGraph: {
      title: "Tour Korea",
      description: isKo
        ? "지도에서 한국의 관광지, 맛집, 숙박, 쇼핑 명소를 탐색하세요"
        : "Explore Korea's best attractions, restaurants, accommodations, and more",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Tour Korea",
      description: isKo
        ? "지도에서 한국의 관광지, 맛집, 숙박, 쇼핑 명소를 탐색하세요"
        : "Explore Korea's best attractions, restaurants, accommodations, and more on an interactive map",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${notoSansKR.variable}`}>
      <body className="h-screen overflow-hidden font-sans antialiased">
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
