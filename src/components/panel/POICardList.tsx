"use client";

import { useLocale, useTranslations } from "next-intl";
import POICard from "./POICard";
import { CATEGORY_MAP } from "@/lib/categories";
import type { CategoryCardGroup } from "@/types/poi";

interface POICardListProps {
  groups: CategoryCardGroup[];
  totalVisible: number;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export default function POICardList({
  groups,
  totalVisible,
  selectedSlug,
  onSelect,
}: POICardListProps) {
  const locale = useLocale() as "ko" | "en";
  const t = useTranslations("search");

  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
        {t("viewportResults", { count: totalVisible.toLocaleString() })}
      </p>
      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        groups.map((group) => {
          const cat = CATEGORY_MAP[group.category];
          if (!cat) return null;
          return (
            <section key={group.category}>
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                    style={{ backgroundColor: cat.color + "20" }}
                    aria-hidden="true"
                  >
                    {cat.icon}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {cat.label[locale]}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {t("perCategory", { count: group.total.toLocaleString() })}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {group.items.map((poi) => (
                  <li key={poi.id} role="option" aria-selected={poi.slug === selectedSlug}>
                    <POICard
                      poi={poi}
                      onSelect={onSelect}
                      isSelected={poi.slug === selectedSlug}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
