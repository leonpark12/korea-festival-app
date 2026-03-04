import { useTranslations } from "next-intl";
import type { POI } from "@/types/poi";

interface SpotInfoProps {
  poi: POI;
}

/** HTML 문자열에서 <br> 태그를 줄바꿈으로 변환하고 나머지 태그는 제거한다. */
function renderHtmlText(html: string) {
  const parts = html.split(/<br\s*\/?>/gi);
  return parts.map((part, i) => {
    const text = part.replace(/<[^>]+>/g, "").trim();
    if (!text) return null;
    return (
      <span key={i}>
        {i > 0 && <br />}
        {text}
      </span>
    );
  });
}

function safeHostname(url: string): string {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname;
  } catch {
    return url;
  }
}

function safeHref(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

export default function SpotInfo({ poi }: SpotInfoProps) {
  const t = useTranslations("poi");
  const tSpot = useTranslations("spot");

  const intro = poi.intro?.[0];
  const hasVisitInfo =
    intro && (intro.usetime || intro.restdate || intro.parking);
  const infoItems = poi.info?.filter((item) => item.infoname && item.infotext);
  const hasInfoItems = infoItems && infoItems.length > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Description */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {t("description")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {poi.description ? renderHtmlText(poi.description) : tSpot("noDescription")}
        </p>
      </section>

      {/* Visit Info (from intro) */}
      {hasVisitInfo && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            {tSpot("visitInfo")}
          </h2>
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
            {intro.usetime && (
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-base text-muted-foreground">
                  &#x1F553;
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {tSpot("hours")}
                  </p>
                  <p className="text-sm text-foreground">{renderHtmlText(intro.usetime)}</p>
                </div>
              </div>
            )}
            {intro.restdate && (
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-base text-muted-foreground">
                  &#x1F4C5;
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {tSpot("closedDays")}
                  </p>
                  <p className="text-sm text-foreground">{renderHtmlText(intro.restdate)}</p>
                </div>
              </div>
            )}
            {intro.parking && (
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-base text-muted-foreground">
                  &#x1F17F;
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {tSpot("parking")}
                  </p>
                  <p className="text-sm text-foreground">{renderHtmlText(intro.parking)}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Facility Info (from info) */}
      {hasInfoItems && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            {tSpot("facilityInfo")}
          </h2>
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
            {infoItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-base text-muted-foreground">
                  &#x2139;
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.infoname}
                  </p>
                  <p className="text-sm text-foreground">{item.infotext ? renderHtmlText(item.infotext) : null}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Details */}
      <section className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">&#x1F4CD;</span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("address")}
            </p>
            <p className="text-sm text-foreground">{poi.address}</p>
          </div>
        </div>

        {/* Contact */}
        {poi.contact && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">&#x1F4DE;</span>
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
            <span className="mt-0.5 text-lg">&#x1F310;</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("website")}
              </p>
              <a
                href={safeHref(poi.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {safeHostname(poi.website)}
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
        &#x1F4CD; {t("openInMaps")}
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
