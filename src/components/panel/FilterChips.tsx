"use client";

import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/categories";
import { REGIONS } from "@/lib/regions";
import type { Category, RegionCode } from "@/types/poi";

interface FilterChipsProps {
  selectedCategories: string[];
  selectedRegion: string | null;
  onToggleCategory: (cat: string) => void;
  onSelectRegion: (region: string | null) => void;
  layout?: "horizontal" | "vertical";
}

export default function FilterChips({
  selectedCategories,
  selectedRegion,
  onToggleCategory,
  onSelectRegion,
  layout = "horizontal",
}: FilterChipsProps) {
  const locale = useLocale() as "ko" | "en";
  const t = useTranslations("filter");

  return (
    <div className="flex flex-col gap-3">
      {/* Category chips */}
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
          {t("category")}
        </legend>
        <div
          className={
            layout === "vertical"
              ? "flex flex-wrap gap-1.5"
              : "-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
          }
          role="group"
          aria-label={t("category")}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                aria-pressed={isActive}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-transparent text-white"
                    : "border-border bg-white text-foreground hover:bg-muted"
                }`}
                style={isActive ? { backgroundColor: cat.color } : undefined}
              >
                <span className="text-[11px]" aria-hidden="true">{cat.icon}</span>
                {cat.label[locale]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Region select */}
      <div>
        <label htmlFor="region-select" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {t("region")}
        </label>
        <select
          id="region-select"
          value={selectedRegion ?? ""}
          onChange={(e) =>
            onSelectRegion(e.target.value || null)
          }
          className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">{t("all")}</option>
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name[locale]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
