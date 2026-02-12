import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getAllPOIs, getPOIBySlug, getNearbyPOIs } from "@/lib/data-loader";
import SpotHero from "@/components/spot/SpotHero";
import SpotInfo from "@/components/spot/SpotInfo";
import SpotJsonLd from "@/components/spot/SpotJsonLd";
import NearbySpots from "@/components/spot/NearbySpots";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const pois = getAllPOIs();
  const params: { locale: string; slug: string }[] = [];

  for (const locale of routing.locales) {
    for (const poi of pois) {
      params.push({ locale, slug: poi.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const poi = getPOIBySlug(slug);
  if (!poi) return {};

  const loc = locale as "ko" | "en";

  return {
    title: poi.name[loc],
    description:
      poi.description?.[loc] ?? `${poi.name[loc]} - ${poi.address[loc]}`,
    alternates: {
      canonical: `/${locale}/spots/${slug}`,
      languages: {
        ko: `/ko/spots/${slug}`,
        en: `/en/spots/${slug}`,
      },
    },
    openGraph: {
      title: poi.name[loc],
      description:
        poi.description?.[loc] ?? `${poi.name[loc]} - ${poi.address[loc]}`,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      type: "article",
    },
  };
}

export default async function SpotPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const poi = getPOIBySlug(slug);
  if (!poi) notFound();

  const loc = locale as "ko" | "en";
  const nearby = getNearbyPOIs(
    poi.coordinates.lat,
    poi.coordinates.lng,
    poi.slug
  );

  return (
    <div className="min-h-screen bg-white">
      <SpotJsonLd poi={poi} locale={loc} />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-white"
        >
          ← Back
        </Link>
      </div>

      <SpotHero poi={poi} locale={loc} />
      <SpotInfo poi={poi} locale={loc} />
      <NearbySpots pois={nearby} locale={loc} />
    </div>
  );
}
