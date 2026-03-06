import { Suspense } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getPOIBySlug, getNearbyPOIs } from "@/lib/data-loader";
import type { POI } from "@/types/poi";
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

async function NearbySection({ locale, poi }: { locale: string; poi: POI }) {
  const nearby = await getNearbyPOIs(
    locale,
    poi.coordinates.lat,
    poi.coordinates.lng,
    poi.slug
  );
  return <NearbySpots pois={nearby} locale={locale as "ko" | "en"} />;
}

function NearbySpotsSkeleton() {
  return (
    <section className="border-t border-border p-4 sm:p-6">
      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-muted/50"
          />
        ))}
      </div>
    </section>
  );
}

export default async function SpotPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const poi = await getPOIBySlug(locale, slug);
  if (!poi) notFound();

  const loc = locale as "ko" | "en";

  return (
    <div className="h-dvh overflow-y-auto overscroll-y-contain bg-white">
      <SpotJsonLd poi={poi} />

      <div className="relative">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <SpotHero poi={poi} locale={loc} />
      </div>
      <SpotInfo poi={poi} />
      <Suspense fallback={<NearbySpotsSkeleton />}>
        <NearbySection locale={locale} poi={poi} />
      </Suspense>
    </div>
  );
}
