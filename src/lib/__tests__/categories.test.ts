import { describe, it, expect } from "vitest";
import { CATEGORIES, CATEGORY_MAP, CATEGORY_COLORS } from "../categories";

describe("categories", () => {
  it("has 8 categories", () => {
    expect(CATEGORIES).toHaveLength(8);
  });

  it("each category has required fields", () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(cat.icon).toBeTruthy();
      expect(cat.label.ko).toBeTruthy();
      expect(cat.label.en).toBeTruthy();
    }
  });

  it("all category IDs are unique", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("CATEGORY_MAP contains all categories", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_MAP[cat.id]).toBe(cat);
    }
  });

  it("CATEGORY_COLORS maps id to color", () => {
    expect(CATEGORY_COLORS).toHaveLength(8);
    for (const [id, color] of CATEGORY_COLORS) {
      expect(CATEGORY_MAP[id as keyof typeof CATEGORY_MAP].color).toBe(color);
    }
  });
});
