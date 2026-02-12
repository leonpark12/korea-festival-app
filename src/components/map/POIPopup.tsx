import { Popup } from "react-map-gl/mapbox";
import { useLocale, useTranslations } from "next-intl";
import { CATEGORY_MAP } from "@/lib/categories";
import type { POI } from "@/types/poi";
import { Link } from "@/i18n/navigation";

interface POIPopupProps {
  poi: POI;
  onClose: () => void;
}

export default function POIPopup({ poi, onClose }: POIPopupProps) {
  const locale = useLocale() as "ko" | "en";
  const t = useTranslations("poi");
  const cat = CATEGORY_MAP[poi.category];

  return (
    <Popup
      longitude={poi.coordinates.lng}
      latitude={poi.coordinates.lat}
      anchor="bottom"
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      maxWidth="280px"
      offset={12}
    >
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
            style={{ backgroundColor: cat.color + "20", color: cat.color }}
          >
            {cat.icon}
          </span>
          <span className="text-xs font-medium" style={{ color: cat.color }}>
            {cat.label[locale]}
          </span>
        </div>
        <h3 className="mb-1 text-sm font-bold text-foreground">
          {poi.name[locale]}
        </h3>
        <p className="mb-2 text-xs text-muted-foreground">
          {poi.address[locale]}
        </p>
        {poi.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
            {poi.description[locale]}
          </p>
        )}
        <Link
          href={`/spots/${poi.slug}`}
          className="inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("viewDetail")}
        </Link>
      </div>
    </Popup>
  );
}
