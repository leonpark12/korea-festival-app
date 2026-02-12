import type { POI } from "@/types/poi";

interface SpotJsonLdProps {
  poi: POI;
  locale: "ko" | "en";
}

export default function SpotJsonLd({ poi, locale }: SpotJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: poi.name[locale],
    description: poi.description?.[locale] ?? "",
    address: {
      "@type": "PostalAddress",
      streetAddress: poi.address[locale],
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: poi.coordinates.lat,
      longitude: poi.coordinates.lng,
    },
    ...(poi.website && { url: poi.website }),
    ...(poi.contact && { telephone: poi.contact }),
    ...(poi.images &&
      poi.images.length > 0 && {
        image: poi.images,
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
