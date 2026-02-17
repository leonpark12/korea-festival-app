import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getPOIBySlug, getNearbyPOIs } from "@/lib/data-loader";
import SpotHero from "@/components/spot/SpotHero";
import SpotInfo from "@/components/spot/SpotInfo";
import SpotJsonLd from "@/components/spot/SpotJsonLd";
import NearbySpots from "@/components/spot/NearbySpots";
import BackButton from "@/components/spot/BackButton";

// ISR: 상세 페이지를 빌드 타임에 생성하지 않고, 첫 방문 시 생성 후 24시간 캐시
export const dynamicParams = true;
export const revalidate = 86400; // 24h

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const poi = await getPOIBySlug(locale, slug);
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

  const poi = await getPOIBySlug(locale, slug);
  if (!poi) notFound();

  const loc = locale as "ko" | "en";
  const nearby = await getNearbyPOIs(
    locale,
    poi.coordinates.lat,
    poi.coordinates.lng,
    poi.slug
  );

  return (
    <div className="h-screen overflow-y-auto overscroll-y-contain bg-white">
      <SpotJsonLd poi={poi} />

      <div className="relative">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <SpotHero poi={poi} locale={loc} />
      </div>
      <SpotInfo poi={poi} />
      <NearbySpots pois={nearby} locale={loc} />
    </div>
  );
}
