"use client";

import { useLocale, useTranslations } from "next-intl";
import { CATEGORY_MAP } from "@/lib/categories";
import type { POI } from "@/types/poi";

interface POICardProps {
  poi: POI;
  onSelect: (slug: string) => void;
  isSelected?: boolean;
}

export default function POICard({ poi, onSelect, isSelected }: POICardProps) {
  const locale = useLocale() as "ko" | "en";
  const t = useTranslations("poi");
  const cat = CATEGORY_MAP[poi.category];

  return (
    <button
      onClick={() => onSelect(poi.slug)}
      aria-selected={isSelected}
      aria-label={`${poi.name[locale]} - ${cat.label[locale]}`}
      className={`w-full rounded-xl border p-3 text-left transition-all hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-white hover:border-muted-foreground/20"
      }`}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
          style={{ backgroundColor: cat.color + "20" }}
          aria-hidden="true"
        >
          {cat.icon}
        </span>
        <span className="text-[11px] font-medium" style={{ color: cat.color }}>
          {cat.label[locale]}
        </span>
      </div>
      <h3 className="mb-0.5 text-sm font-semibold text-foreground">
        {poi.name[locale]}
      </h3>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {poi.address[locale]}
      </p>
    </button>
  );
}
