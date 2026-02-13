import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getAllSlugs, getPOIBySlug, getNearbyPOIs } from "@/lib/data-loader";
import SpotHero from "@/components/spot/SpotHero";
import SpotInfo from "@/components/spot/SpotInfo";
import SpotJsonLd from "@/components/spot/SpotJsonLd";
import NearbySpots from "@/components/spot/NearbySpots";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of routing.locales) {
    const slugs = getAllSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const poi = getPOIBySlug(locale, slug);
  if (!poi) return {};

  return {
    title: poi.name,
    description: poi.description ?? `${poi.name} - ${poi.address}`,
    alternates: {
      canonical: `/${locale}/spots/${slug}`,
    },
    openGraph: {
      title: poi.name,
      description: poi.description ?? `${poi.name} - ${poi.address}`,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      type: "article",
    },
  };
}

export default async function SpotPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const poi = getPOIBySlug(locale, slug);
  if (!poi) notFound();

  const loc = locale as "ko" | "en";
  const nearby = getNearbyPOIs(
    locale,
    poi.coordinates.lat,
    poi.coordinates.lng,
    poi.slug
  );

  return (
    <div className="min-h-screen bg-white">
      <SpotJsonLd poi={poi} />

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
      <SpotInfo poi={poi} />
      <NearbySpots pois={nearby} locale={loc} />
    </div>
  );
}
