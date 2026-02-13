"use client";

import { useLocale, useTranslations } from "next-intl";
import { CATEGORY_MAP } from "@/lib/categories";
import { Link } from "@/i18n/navigation";
import type { POI } from "@/types/poi";

interface POIPreviewCardProps {
  poi: POI;
  onClose: () => void;
}

export default function POIPreviewCard({ poi, onClose }: POIPreviewCardProps) {
  const locale = useLocale() as "ko" | "en";
  const t = useTranslations("poi");
  const tCommon = useTranslations("common");
  const cat = CATEGORY_MAP[poi.category];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
            style={{ backgroundColor: cat.color + "20", color: cat.color }}
          >
            {cat.icon}
          </span>
          <span className="text-xs font-medium" style={{ color: cat.color }}>
            {cat.label[locale]}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label={tCommon("close")}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M11 3L3 11M3 3l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <h3 className="text-sm font-bold text-foreground">
        {poi.name}
      </h3>
      <p className="text-xs text-muted-foreground">{poi.address}</p>
      {poi.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {poi.description}
        </p>
      )}

      <Link
        href={`/spots/${poi.slug}`}
        className="mt-1 flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("viewDetail")}
      </Link>
    </div>
  );
}
