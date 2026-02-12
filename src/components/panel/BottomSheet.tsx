"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import POICardList from "./POICardList";
import type { POI } from "@/types/poi";

type SnapPoint = "closed" | "peek" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  closed: "0px",
  peek: "120px",
  half: "50vh",
  full: "calc(100vh - 56px)",
};

interface BottomSheetProps {
  pois: POI[];
  selectedSlug: string | null;
  selectedCategories: string[];
  selectedRegion: string | null;
  searchResults: POI[];
  onSearch: (query: string) => void;
  onToggleCategory: (cat: string) => void;
  onSelectRegion: (region: string | null) => void;
  onSelectPOI: (slug: string) => void;
}

export default function BottomSheet({
  pois,
  selectedSlug,
  selectedCategories,
  selectedRegion,
  searchResults,
  onSearch,
  onToggleCategory,
  onSelectRegion,
  onSelectPOI,
}: BottomSheetProps) {
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
        if (snap === "peek") setSnap("half");
        else if (snap === "half") setSnap("full");
      } else if (diff < -threshold) {
        // Dragging down
        if (snap === "full") setSnap("half");
        else if (snap === "half") setSnap("peek");
      }
    },
    [snap]
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
      style={{ height: SNAP_HEIGHTS[snap] }}
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
        {/* Horizontal filter chips for mobile */}
        <div className="scrollbar-hide overflow-x-auto">
          <FilterChips
            selectedCategories={selectedCategories}
            selectedRegion={selectedRegion}
            onToggleCategory={onToggleCategory}
            onSelectRegion={onSelectRegion}
          />
        </div>

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
      </div>
    </div>
  );
}
