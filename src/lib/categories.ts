import type { Category } from "@/types/poi";

export interface CategoryMeta {
  id: Category;
  color: string;
  icon: string;
  label: { ko: string; en: string };
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "attraction",
    color: "#FF6B6B",
    icon: "🏛️",
    label: { ko: "관광지", en: "Attractions" },
  },
  {
    id: "restaurant",
    color: "#FFA94D",
    icon: "🍽️",
    label: { ko: "맛집", en: "Restaurants" },
  },
  {
    id: "accommodation",
    color: "#69DB7C",
    icon: "🏨",
    label: { ko: "숙박", en: "Accommodation" },
  },
  {
    id: "shopping",
    color: "#9775FA",
    icon: "🛍️",
    label: { ko: "쇼핑", en: "Shopping" },
  },
  {
    id: "festival",
    color: "#FF8787",
    icon: "🎪",
    label: { ko: "축제", en: "Festivals" },
  },
  {
    id: "culture",
    color: "#748FFC",
    icon: "🎭",
    label: { ko: "문화", en: "Culture" },
  },
  {
    id: "nature",
    color: "#38D9A9",
    icon: "🌿",
    label: { ko: "자연", en: "Nature" },
  },
  {
    id: "leisure",
    color: "#F783AC",
    icon: "🎢",
    label: { ko: "레저", en: "Leisure" },
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<Category, CategoryMeta>;

export const CATEGORY_COLORS: [string, string][] = CATEGORIES.map((c) => [
  c.id,
  c.color,
]);
