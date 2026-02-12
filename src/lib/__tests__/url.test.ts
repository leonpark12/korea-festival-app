import { describe, it, expect } from "vitest";
import { toSlug, spotUrl, mapUrl } from "../url";

describe("url", () => {
  describe("toSlug", () => {
    it("converts spaces to hyphens", () => {
      expect(toSlug("hello world")).toBe("hello-world");
    });

    it("lowercases text", () => {
      expect(toSlug("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      expect(toSlug("hello! @world#")).toBe("hello-world");
    });

    it("collapses multiple hyphens", () => {
      expect(toSlug("hello   world")).toBe("hello-world");
    });

    it("preserves Korean characters", () => {
      expect(toSlug("서울 타워")).toBe("서울-타워");
    });
  });

  describe("spotUrl", () => {
    it("generates correct spot URL", () => {
      expect(spotUrl("ko", "namsan-tower")).toBe("/ko/spots/namsan-tower");
      expect(spotUrl("en", "gyeongbokgung")).toBe("/en/spots/gyeongbokgung");
    });
  });

  describe("mapUrl", () => {
    it("generates base URL without params", () => {
      expect(mapUrl("ko")).toBe("/ko");
      expect(mapUrl("en")).toBe("/en");
    });

    it("appends search params", () => {
      const url = mapUrl("ko", { cat: "restaurant", region: "seoul" });
      expect(url).toContain("/ko?");
      expect(url).toContain("cat=restaurant");
      expect(url).toContain("region=seoul");
    });
  });
});
