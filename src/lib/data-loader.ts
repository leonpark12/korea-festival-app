import type { POI, POIGeoJSON } from "@/types/poi";
import poisData from "@/data/pois.json";
import geojsonData from "@/data/pois.geo.json";

export function getAllPOIs(): POI[] {
  return poisData as POI[];
}

export function getPOIBySlug(slug: string): POI | undefined {
  return getAllPOIs().find((poi) => poi.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPOIs().map((poi) => poi.slug);
}

export function getGeoJSON(): POIGeoJSON {
  return geojsonData as unknown as POIGeoJSON;
}

export function getNearbyPOIs(
  lat: number,
  lng: number,
  excludeSlug: string,
  limit = 4
): POI[] {
  const all = getAllPOIs();
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
