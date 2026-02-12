import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_MAP } from "@/lib/categories";
import type { POI } from "@/types/poi";

interface NearbySpotsProps {
  pois: POI[];
  locale: "ko" | "en";
}

export default function NearbySpots({ pois, locale }: NearbySpotsProps) {
  const t = useTranslations("spot");

  if (pois.length === 0) return null;

  return (
    <section className="border-t border-border p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {t("nearbyTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pois.map((poi) => {
          const cat = CATEGORY_MAP[poi.category];
          return (
            <Link
              key={poi.id}
              href={`/spots/${poi.slug}`}
              className="rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-xs">{cat.icon}</span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: cat.color }}
                >
                  {cat.label[locale]}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {poi.name[locale]}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {poi.address[locale]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
