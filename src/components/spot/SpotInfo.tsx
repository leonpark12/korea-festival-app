import { useTranslations } from "next-intl";
import type { POI } from "@/types/poi";

interface SpotInfoProps {
  poi: POI;
  locale: "ko" | "en";
}

export default function SpotInfo({ poi, locale }: SpotInfoProps) {
  const t = useTranslations("poi");
  const tSpot = useTranslations("spot");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Description */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {t("description")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {poi.description?.[locale] ?? tSpot("noDescription")}
        </p>
      </section>

      {/* Details */}
      <section className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">📍</span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("address")}
            </p>
            <p className="text-sm text-foreground">{poi.address[locale]}</p>
          </div>
        </div>

        {/* Contact */}
        {poi.contact && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">📞</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("contact")}
              </p>
              <a
                href={`tel:${poi.contact}`}
                className="text-sm text-primary hover:underline"
              >
                {poi.contact}
              </a>
            </div>
          </div>
        )}

        {/* Website */}
        {poi.website && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">🌐</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("website")}
              </p>
              <a
                href={poi.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {new URL(poi.website).hostname}
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Open in Maps */}
      <a
        href={`https://maps.google.com/maps?q=${poi.coordinates.lat},${poi.coordinates.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        📍 {t("openInMaps")}
      </a>

      {/* Tags */}
      {poi.tags && poi.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {poi.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
