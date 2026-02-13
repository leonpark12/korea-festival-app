"use client";

import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import POICardList from "./POICardList";
import type { POISummary } from "@/types/poi";

interface SidePanelProps {
  pois: POISummary[];
  selectedSlug: string | null;
  selectedCategories: string[];
  selectedRegion: string | null;
  searchResults: POISummary[];
  onSearch: (query: string) => void;
  onToggleCategory: (cat: string) => void;
  onSelectRegion: (region: string | null) => void;
  onSelectPOI: (slug: string) => void;
}

export default function SidePanel({
  pois,
  selectedSlug,
  selectedCategories,
  selectedRegion,
  searchResults,
  onSearch,
  onToggleCategory,
  onSelectRegion,
  onSelectPOI,
}: SidePanelProps) {
  return (
    <aside aria-label="관광지 탐색" className="absolute top-14 left-0 z-10 hidden h-[calc(100%-56px)] w-96 flex-col border-r border-border bg-white lg:flex">
      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        <SearchBar
          onSearch={onSearch}
          searchResults={searchResults}
          onSelect={onSelectPOI}
        />
        <FilterChips
          selectedCategories={selectedCategories}
          selectedRegion={selectedRegion}
          onToggleCategory={onToggleCategory}
          onSelectRegion={onSelectRegion}
        />
        <POICardList
          pois={pois}
          selectedSlug={selectedSlug}
          onSelect={onSelectPOI}
        />
      </div>
    </aside>
  );
}
