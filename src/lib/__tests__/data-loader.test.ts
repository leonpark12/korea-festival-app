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
    it("returns all KR POIs as an array", async () => {
      const pois = await getAllPOIs("ko");
      expect(Array.isArray(pois)).toBe(true);
      expect(pois.length).toBeGreaterThan(0);
    });

    it("returns all EN POIs as an array", async () => {
      const pois = await getAllPOIs("en");
      expect(Array.isArray(pois)).toBe(true);
      expect(pois.length).toBeGreaterThan(0);
    });

    it("each POI has required fields (monolingual)", async () => {
      for (const locale of ["ko", "en"]) {
        const pois = await getAllPOIs(locale);
        for (const poi of pois) {
          expect(poi).toHaveProperty("id");
          expect(poi).toHaveProperty("slug");
          expect(typeof poi.name).toBe("string");
          expect(typeof poi.address).toBe("string");
          expect(poi).toHaveProperty("category");
          expect(poi).toHaveProperty("region");
          expect(poi).toHaveProperty("coordinates.lat");
          expect(poi).toHaveProperty("coordinates.lng");
        }
      }
    });

    it("maps API categories to app categories", async () => {
      const validCategories = [
        "attraction",
        "restaurant",
        "accommodation",
        "shopping",
        "festival",
        "culture",
        "nature",
        "leisure",
      ];
      for (const locale of ["ko", "en"]) {
        const pois = await getAllPOIs(locale);
        for (const poi of pois) {
          expect(validCategories).toContain(poi.category);
        }
      }
    });
  });

  describe("getPOIBySlug", () => {
    it("returns a POI for a valid KR slug", async () => {
      const slugs = await getAllSlugs("ko");
      const poi = await getPOIBySlug("ko", slugs[0]);
      expect(poi).toBeDefined();
      expect(poi?.slug).toBe(slugs[0]);
    });

    it("returns a POI for a valid EN slug", async () => {
      const slugs = await getAllSlugs("en");
      const poi = await getPOIBySlug("en", slugs[0]);
      expect(poi).toBeDefined();
      expect(poi?.slug).toBe(slugs[0]);
    });

    it("returns undefined for an invalid slug", async () => {
      const poi = await getPOIBySlug("ko", "nonexistent-slug-xyz");
      expect(poi).toBeUndefined();
    });
  });

  describe("getAllSlugs", () => {
    it("returns unique slugs per locale", async () => {
      for (const locale of ["ko", "en"]) {
        const slugs = await getAllSlugs(locale);
        const unique = new Set(slugs);
        expect(slugs.length).toBe(unique.size);
      }
    });

    it("KR and EN may have different slug sets", async () => {
      const krSlugs = await getAllSlugs("ko");
      const enSlugs = await getAllSlugs("en");
      // They can differ in count and content
      expect(krSlugs.length).toBeGreaterThan(0);
      expect(enSlugs.length).toBeGreaterThan(0);
    });
  });

  describe("getGeoJSON", () => {
    it("returns a valid GeoJSON FeatureCollection", async () => {
      for (const locale of ["ko", "en"]) {
        const geojson = await getGeoJSON(locale);
        expect(geojson.type).toBe("FeatureCollection");
        expect(Array.isArray(geojson.features)).toBe(true);
        expect(geojson.features.length).toBeGreaterThan(0);
      }
    });

    it("each feature has Point geometry and mapped category", async () => {
      const validCategories = [
        "attraction",
        "restaurant",
        "accommodation",
        "shopping",
        "festival",
        "culture",
        "nature",
        "leisure",
      ];
      for (const locale of ["ko", "en"]) {
        const geojson = await getGeoJSON(locale);
        for (const feature of geojson.features) {
          expect(feature.geometry.type).toBe("Point");
          expect(feature.geometry.coordinates).toHaveLength(2);
          expect(validCategories).toContain(feature.properties.category);
        }
      }
    });
  });

  describe("getNearbyPOIs", () => {
    it("returns nearby POIs excluding the given slug", async () => {
      const pois = await getAllPOIs("ko");
      const target = pois[0];
      const nearby = await getNearbyPOIs(
        "ko",
        target.coordinates.lat,
        target.coordinates.lng,
        target.slug
      );
      expect(nearby.every((p) => p.slug !== target.slug)).toBe(true);
    });

    it("respects the limit parameter", async () => {
      const pois = await getAllPOIs("ko");
      const target = pois[0];
      const nearby = await getNearbyPOIs(
        "ko",
        target.coordinates.lat,
        target.coordinates.lng,
        target.slug,
        2
      );
      expect(nearby.length).toBeLessThanOrEqual(2);
    });
  });
});
