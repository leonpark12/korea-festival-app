import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_MAP } from "@/lib/categories";
import type { NearbyPOI } from "@/types/poi";

interface NearbySpotsProps {
  pois: NearbyPOI[];
  locale: "ko" | "en";
}

function formatDistance(meters?: number): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function NearbySpots({ pois, locale }: NearbySpotsProps) {
  const t = useTranslations("spot");

  if (pois.length === 0) return null;

  return (
    <section className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))] sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))]">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {t("nearbyTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pois.map((poi) => {
          const cat = CATEGORY_MAP[poi.category];
          const dist = formatDistance(poi.distance);
          return (
            <Link
              key={poi.id}
              href={`/spots/${poi.slug}`}
              className="flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
            >
              {poi.thumbnail ? (
                <Image
                  src={poi.thumbnail}
                  alt={poi.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-xl"
                  style={{ backgroundColor: cat.color + "20" }}
                >
                  {cat.icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {poi.name}
                </p>
                {poi.description && poi.description !== poi.name && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {poi.description}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="text-[10px]">{cat.icon}</span>
                  <span style={{ color: cat.color }}>{cat.label[locale]}</span>
                  {dist && (
                    <>
                      <span>·</span>
                      <span>{dist}</span>
                    </>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
