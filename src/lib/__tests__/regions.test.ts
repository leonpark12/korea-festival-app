import { describe, it, expect } from "vitest";
import { REGIONS, REGION_MAP } from "../regions";

describe("regions", () => {
  it("has 17 regions", () => {
    expect(REGIONS).toHaveLength(17);
  });

  it("all region codes are unique", () => {
    const codes = REGIONS.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("each region has required fields", () => {
    for (const region of REGIONS) {
      expect(region.code).toBeTruthy();
      expect(region.name.ko).toBeTruthy();
      expect(region.name.en).toBeTruthy();
      expect(region.center).toHaveLength(2);
      expect(region.bbox).toHaveLength(4);

      // Center should be within bbox
      const [minLng, minLat, maxLng, maxLat] = region.bbox;
      const [centerLng, centerLat] = region.center;
      expect(centerLng).toBeGreaterThanOrEqual(minLng);
      expect(centerLng).toBeLessThanOrEqual(maxLng);
      expect(centerLat).toBeGreaterThanOrEqual(minLat);
      expect(centerLat).toBeLessThanOrEqual(maxLat);
    }
  });

  it("REGION_MAP contains all regions", () => {
    for (const region of REGIONS) {
      expect(REGION_MAP[region.code]).toBe(region);
    }
  });
});
