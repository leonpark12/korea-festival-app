"use client";

import { useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import FilterChips from "./FilterChips";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  selectedRegion: string | null;
  onToggleCategory: (cat: string) => void;
  onSelectRegion: (region: string | null) => void;
  onClearFilters: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  selectedCategories,
  selectedRegion,
  onToggleCategory,
  onSelectRegion,
  onClearFilters,
}: FilterDrawerProps) {
  const t = useTranslations("filter");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const hasFilters = selectedCategories.length > 0 || selectedRegion !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: 56 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("openDrawer")}
        className={`fixed bottom-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: 56 }}
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              {t("openDrawer")}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <FilterChips
            selectedCategories={selectedCategories}
            selectedRegion={selectedRegion}
            onToggleCategory={onToggleCategory}
            onSelectRegion={onSelectRegion}
            layout="vertical"
          />

          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="mt-2 flex h-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              {t("clear")}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
