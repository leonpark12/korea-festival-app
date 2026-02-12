"use client";

import { useTranslations } from "next-intl";
import POICard from "./POICard";
import type { POI } from "@/types/poi";

interface POICardListProps {
  pois: POI[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export default function POICardList({
  pois,
  selectedSlug,
  onSelect,
}: POICardListProps) {
  const t = useTranslations("search");

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
        {t("results", { count: pois.length })}
      </p>
      {pois.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        <ul role="listbox" aria-label={t("results", { count: pois.length })} className="flex flex-col gap-2">
          {pois.map((poi) => (
            <li key={poi.id} role="option" aria-selected={poi.slug === selectedSlug}>
              <POICard
                poi={poi}
                onSelect={onSelect}
                isSelected={poi.slug === selectedSlug}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
