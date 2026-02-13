"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import POICardList from "./POICardList";
import POIPreviewCard from "./POIPreviewCard";
import type { POI } from "@/types/poi";

type SnapPoint = "closed" | "peek" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  closed: "0px",
  peek: "120px",
  half: "50vh",
  full: "calc(100vh - 56px)",
};

const PREVIEW_PEEK_HEIGHT = "200px";

interface BottomSheetProps {
  pois: POI[];
  selectedSlug: string | null;
  selectedCategories: string[];
  selectedRegion: string | null;
  searchResults: POI[];
  selectedPOI?: POI | null;
  onSearch: (query: string) => void;
  onToggleCategory: (cat: string) => void;
  onSelectRegion: (region: string | null) => void;
  onSelectPOI: (slug: string) => void;
  onDeselectPOI?: () => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
}

export default function BottomSheet({
  pois,
  selectedSlug,
  selectedCategories,
  selectedRegion,
  searchResults,
  selectedPOI,
  onSearch,
  onToggleCategory,
  onSelectRegion,
  onSelectPOI,
  onDeselectPOI,
  onOpenFilter,
  activeFilterCount = 0,
}: BottomSheetProps) {
  const t = useTranslations("filter");
  const [snap, setSnap] = useState<SnapPoint>("peek");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      dragStartY.current = clientY;
    },
    []
  );

  const handleDragEnd = useCallback(
    (clientY: number) => {
      setIsDragging(false);
      const diff = dragStartY.current - clientY;
      const threshold = 50;

      if (diff > threshold) {
        // Dragging up
        if (snap === "peek") {
          if (selectedPOI) onDeselectPOI?.();
          setSnap("half");
        } else if (snap === "half") setSnap("full");
      } else if (diff < -threshold) {
        // Dragging down
        if (snap === "full") setSnap("half");
        else if (snap === "half") setSnap("peek");
      }
    },
    [snap, selectedPOI, onDeselectPOI]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && snap !== "peek") {
        setSnap("peek");
      }
    },
    [snap]
  );

  const handleSelectAndClose = useCallback(
    (slug: string) => {
      onSelectPOI(slug);
      setSnap("peek");
    },
    [onSelectPOI]
  );

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="false"
      aria-label="관광지 목록"
      onKeyDown={handleKeyDown}
      className="fixed bottom-0 left-0 right-0 z-30 rounded-t-2xl border-t border-border bg-white shadow-2xl transition-[height] duration-300 ease-out lg:hidden"
      style={{
        height:
          snap === "peek" && selectedPOI
            ? PREVIEW_PEEK_HEIGHT
            : SNAP_HEIGHTS[snap],
      }}
    >
      {/* Handle */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="패널 크기 조절"
        aria-valuetext={snap}
        className="flex cursor-grab touch-none items-center justify-center py-3 active:cursor-grabbing"
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onMouseUp={(e) => handleDragEnd(e.clientY)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (snap === "peek") setSnap("half");
            else if (snap === "half") setSnap("full");
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (snap === "full") setSnap("half");
            else if (snap === "half") setSnap("peek");
          }
        }}
      >
        <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-28px)] flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4">
        {snap === "peek" && selectedPOI ? (
          <POIPreviewCard poi={selectedPOI} onClose={() => onDeselectPOI?.()} />
        ) : (
          <>
            {onOpenFilter ? (
              <button
                onClick={onOpenFilter}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4h12M4 8h8M6 12h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {t("openDrawer")}
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            ) : (
              <div className="scrollbar-hide overflow-x-auto">
                <FilterChips
                  selectedCategories={selectedCategories}
                  selectedRegion={selectedRegion}
                  onToggleCategory={onToggleCategory}
                  onSelectRegion={onSelectRegion}
                />
              </div>
            )}

            {snap !== "peek" && (
              <>
                <SearchBar
                  onSearch={onSearch}
                  searchResults={searchResults}
                  onSelect={handleSelectAndClose}
                />
                <POICardList
                  pois={pois}
                  selectedSlug={selectedSlug}
                  onSelect={handleSelectAndClose}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
