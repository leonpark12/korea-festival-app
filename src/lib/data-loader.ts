import type { POI, POISummary, POIGeoJSON, Category } from "@/types/poi";
import poisKr from "@/data/pois_kr.json";
import poisEn from "@/data/pois_en.json";
import geojsonKr from "@/data/pois_geo_kr.json";
import geojsonEn from "@/data/pois_geo_en.json";

const CATEGORY_MAP_KR: Record<string, Category> = {
  역사관광: "culture",
  문화관광: "culture",
  자연관광: "nature",
  "축제/공연/행사": "festival",
  축제공연행사: "festival",
  숙박: "accommodation",
  레저스포츠: "leisure",
  쇼핑: "shopping",
  음식: "restaurant",
  체험관광: "attraction",
  추천코스: "attraction",
};

const CATEGORY_MAP_EN: Record<string, Category> = {
  "Historical Tourism": "culture",
  "Cultural Tourism": "culture",
  "Nature Tourism": "nature",
  "Festivals/Performances/Events": "festival",
  "Festivals/Events": "festival",
  Accommodation: "accommodation",
  "Leisure Sports": "leisure",
  Shopping: "shopping",
  Food: "restaurant",
  "Experiential Tourism": "attraction",
  "Recommended Course": "attraction",
};

function mapCategory(raw: string, locale: string): Category {
  const map = locale === "ko" ? CATEGORY_MAP_KR : CATEGORY_MAP_EN;
  return map[raw] ?? "attraction";
}

type RawPOI = Omit<POI, "category"> & { category: string };

const poisByLocale: Record<string, RawPOI[]> = {
  ko: poisKr as RawPOI[],
  en: poisEn as RawPOI[],
};

const geojsonByLocale: Record<string, unknown> = {
  ko: geojsonKr,
  en: geojsonEn,
};

const poisCache = new Map<string, POI[]>();
const geojsonCache = new Map<string, POIGeoJSON>();
const slugIndexCache = new Map<string, Map<string, POI>>();

function mapPOIs(locale: string): POI[] {
  let cached = poisCache.get(locale);
  if (cached) return cached;

  const raw = poisByLocale[locale] ?? poisByLocale.ko;
  cached = raw.map((poi) => ({
    ...poi,
    category: mapCategory(poi.category, locale),
  }));
  poisCache.set(locale, cached);
  return cached;
}

function mapGeoJSON(locale: string): POIGeoJSON {
  let cached = geojsonCache.get(locale);
  if (cached) return cached;

  const raw = geojsonByLocale[locale] ?? geojsonByLocale.ko;
  const geojson = raw as { type: string; features: Array<{ type: string; geometry: unknown; properties: Record<string, unknown> }> };
  cached = {
    type: "FeatureCollection",
    features: geojson.features.map((f) => ({
      type: "Feature" as const,
      geometry: f.geometry as { type: "Point"; coordinates: [number, number] },
      properties: {
        ...f.properties,
        category: mapCategory(f.properties.category as string, locale),
      } as POIGeoJSON["features"][0]["properties"],
    })),
  };
  geojsonCache.set(locale, cached);
  return cached;
}

function getSlugIndex(locale: string): Map<string, POI> {
  let index = slugIndexCache.get(locale);
  if (index) return index;

  index = new Map(getAllPOIs(locale).map((poi) => [poi.slug, poi]));
  slugIndexCache.set(locale, index);
  return index;
}

export function getAllPOIs(locale: string): POI[] {
  return mapPOIs(locale);
}

export function getAllPOISummaries(locale: string): POISummary[] {
  return getAllPOIs(locale).map(
    ({ id, slug, name, address, category, region, coordinates }) => ({
      id,
      slug,
      name,
      address,
      category,
      region,
      coordinates,
    })
  );
}

export function getPOIBySlug(locale: string, slug: string): POI | undefined {
  return getSlugIndex(locale).get(slug);
}

export function getAllSlugs(locale: string): string[] {
  return getAllPOIs(locale).map((poi) => poi.slug);
}

export function getGeoJSON(locale: string): POIGeoJSON {
  return mapGeoJSON(locale);
}

export function getNearbyPOIs(
  locale: string,
  lat: number,
  lng: number,
  excludeSlug: string,
  limit = 4
): POI[] {
  const all = getAllPOIs(locale);
  return all
    .filter((poi) => poi.slug !== excludeSlug)
    .map((poi) => ({
      poi,
      dist: Math.sqrt(
        Math.pow(poi.coordinates.lat - lat, 2) +
          Math.pow(poi.coordinates.lng - lng, 2)
      ),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((item) => item.poi);
}
