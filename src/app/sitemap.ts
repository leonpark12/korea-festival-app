import type { MetadataRoute } from "next";
import { getAllPOIs } from "@/lib/data-loader";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korea-travel-map.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Main pages
  for (const locale of routing.locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          ko: `${BASE_URL}/ko`,
          en: `${BASE_URL}/en`,
        },
      },
    });
  }

  // Spot detail pages (per locale, no cross-locale alternates since slugs differ)
  for (const locale of routing.locales) {
    const pois = await getAllPOIs(locale);
    for (const poi of pois) {
      entries.push({
        url: `${BASE_URL}/${locale}/spots/${poi.slug}`,
        lastModified: new Date(poi.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
