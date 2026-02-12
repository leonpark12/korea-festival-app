"use client";

import dynamic from "next/dynamic";
import { CATEGORY_MAP } from "@/lib/categories";
import type { POI } from "@/types/poi";

const SpotMiniMap = dynamic(() => import("./SpotMiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted">
      <span className="text-4xl">🗺️</span>
    </div>
  ),
});

interface SpotHeroProps {
  poi: POI;
  locale: "ko" | "en";
}

export default function SpotHero({ poi, locale }: SpotHeroProps) {
  const cat = CATEGORY_MAP[poi.category];

  return (
    <div className="relative">
      {/* Mini map */}
      <div className="h-48 w-full bg-muted sm:h-64 md:h-72">
        <SpotMiniMap
          lng={poi.coordinates.lng}
          lat={poi.coordinates.lat}
          color={cat.color}
        />
      </div>

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: cat.color }}
          >
            {cat.icon} {cat.label[locale]}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {poi.name[locale]}
        </h1>
        {locale === "ko" && (
          <p className="mt-1 text-sm text-white/80">{poi.name.en}</p>
        )}
      </div>
    </div>
  );
}
