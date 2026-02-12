import { describe, it, expect } from "vitest";
import {
  getAllPOIs,
  getPOIBySlug,
  getAllSlugs,
  getGeoJSON,
  getNearbyPOIs,
} from "../data-loader";

describe("data-loader", () => {
  describe("getAllPOIs", () => {
    it("returns all POIs as an array", () => {
      const pois = getAllPOIs();
      expect(Array.isArray(pois)).toBe(true);
      expect(pois.length).toBeGreaterThan(0);
    });

    it("each POI has required fields", () => {
      const pois = getAllPOIs();
      for (const poi of pois) {
        expect(poi).toHaveProperty("id");
        expect(poi).toHaveProperty("slug");
        expect(poi).toHaveProperty("name.ko");
        expect(poi).toHaveProperty("name.en");
        expect(poi).toHaveProperty("category");
        expect(poi).toHaveProperty("region");
        expect(poi).toHaveProperty("coordinates.lat");
        expect(poi).toHaveProperty("coordinates.lng");
      }
    });
  });

  describe("getPOIBySlug", () => {
    it("returns a POI for a valid slug", () => {
      const slugs = getAllSlugs();
      const poi = getPOIBySlug(slugs[0]);
      expect(poi).toBeDefined();
      expect(poi?.slug).toBe(slugs[0]);
    });

    it("returns undefined for an invalid slug", () => {
      const poi = getPOIBySlug("nonexistent-slug-xyz");
      expect(poi).toBeUndefined();
    });
  });

  describe("getAllSlugs", () => {
    it("returns unique slugs", () => {
      const slugs = getAllSlugs();
      const unique = new Set(slugs);
      expect(slugs.length).toBe(unique.size);
    });
  });

  describe("getGeoJSON", () => {
    it("returns a valid GeoJSON FeatureCollection", () => {
      const geojson = getGeoJSON();
      expect(geojson.type).toBe("FeatureCollection");
      expect(Array.isArray(geojson.features)).toBe(true);
      expect(geojson.features.length).toBeGreaterThan(0);
    });

    it("each feature has Point geometry", () => {
      const geojson = getGeoJSON();
      for (const feature of geojson.features) {
        expect(feature.geometry.type).toBe("Point");
        expect(feature.geometry.coordinates).toHaveLength(2);
      }
    });
  });

  describe("getNearbyPOIs", () => {
    it("returns nearby POIs excluding the given slug", () => {
      const pois = getAllPOIs();
      const target = pois[0];
      const nearby = getNearbyPOIs(
        target.coordinates.lat,
        target.coordinates.lng,
        target.slug
      );
      expect(nearby.every((p) => p.slug !== target.slug)).toBe(true);
    });

    it("respects the limit parameter", () => {
      const pois = getAllPOIs();
      const target = pois[0];
      const nearby = getNearbyPOIs(
        target.coordinates.lat,
        target.coordinates.lng,
        target.slug,
        2
      );
      expect(nearby.length).toBeLessThanOrEqual(2);
    });

    it("returns POIs sorted by distance", () => {
      const pois = getAllPOIs();
      const target = pois[0];
      const nearby = getNearbyPOIs(
        target.coordinates.lat,
        target.coordinates.lng,
        target.slug,
        10
      );

      for (let i = 1; i < nearby.length; i++) {
        const distPrev = Math.sqrt(
          Math.pow(nearby[i - 1].coordinates.lat - target.coordinates.lat, 2) +
            Math.pow(
              nearby[i - 1].coordinates.lng - target.coordinates.lng,
              2
            )
        );
        const distCurr = Math.sqrt(
          Math.pow(nearby[i].coordinates.lat - target.coordinates.lat, 2) +
            Math.pow(nearby[i].coordinates.lng - target.coordinates.lng, 2)
        );
        expect(distPrev).toBeLessThanOrEqual(distCurr);
      }
    });
  });
});
