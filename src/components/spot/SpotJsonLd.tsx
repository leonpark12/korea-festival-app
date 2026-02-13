import type { POI } from "@/types/poi";

interface SpotJsonLdProps {
  poi: POI;
}

export default function SpotJsonLd({ poi }: SpotJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: poi.name,
    description: poi.description ?? "",
    address: {
      "@type": "PostalAddress",
      streetAddress: poi.address,
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
