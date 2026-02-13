"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useLocale } from "next-intl";
import MapView from "./MapView";
import GeolocateFAB from "./GeolocateFAB";
import SidePanel from "../panel/SidePanel";
import BottomSheet from "../panel/BottomSheet";
import FilterDrawer from "../panel/FilterDrawer";
import Header from "../layout/Header";
import { usePOIData } from "@/hooks/usePOIData";
import { useFilteredGeoJSON, useFilteredPOIs } from "@/hooks/useFilteredPOIs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { usePOISearch } from "@/hooks/usePOISearch";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { KOREA_CENTER } from "@/lib/constants";
import type { MapViewState, UserLocation } from "@/types/map";
import type { POI, POISummary } from "@/types/poi";
import type { MapRef } from "react-map-gl/maplibre";

function MapShellInner() {
  const locale = useLocale();
  const { summaries, geojson, isLoading } = usePOIData();
  const { filters, setFilter } = useQueryParams();
  const isDesktop = useIsDesktop();
  const mapRef = useRef<MapRef>(null);
  const zoomRef = useRef(KOREA_CENTER.zoom);

  const [viewState, setViewState] = useState<MapViewState>(() => {
    try {
      const saved = sessionStorage.getItem("mapViewState");
      if (saved) return JSON.parse(saved);
    } catch {}
    return KOREA_CENTER;
  });
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  // Save viewState to sessionStorage on unmount
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem(
          "mapViewState",
          JSON.stringify(viewStateRef.current)
        );
      } catch {}
    };
  }, []);

  const [searchResults, setSearchResults] = useState<POISummary[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const filteredGeoJSON = useFilteredGeoJSON(geojson, filters);
  const filteredPOIs = useFilteredPOIs(summaries, filters);
  const { search } = usePOISearch();

  // Fetch full POI details when selection changes
  useEffect(() => {
    const slug = filters.selectedPOI;
    if (!slug) {
      setSelectedPOI(null);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/pois/${slug}?locale=${locale}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((poi) => {
        if (poi) setSelectedPOI(poi);
      })
      .catch(() => {});
    return () => {
      controller.abort();
    };
  }, [filters.selectedPOI, locale]);

  const handleSearch = useCallback(
    async (query: string) => {
      setFilter("query", query || null);
      const results = await search(query);
      setSearchResults(results);
    },
    [search, setFilter]
  );

  const handleSelectPOI = useCallback(
    (slug: string | null) => {
      setFilter("selectedPOI", slug);
      if (slug) {
        // Use summary coordinates for immediate flyTo
        const summary = summaries.find((p) => p.slug === slug);
        if (summary) {
          mapRef.current?.flyTo({
            center: [summary.coordinates.lng, summary.coordinates.lat],
            zoom: Math.max(zoomRef.current, 13),
            duration: 500,
          });
        }
      }
    },
    [setFilter, summaries]
  );

  const handleToggleCategory = useCallback(
    (cat: string) => {
      const current = filters.categories;
      const next = current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat];
      setFilter("categories", next);
    },
    [filters.categories, setFilter]
  );

  const handleSelectRegion = useCallback(
    (region: string | null) => {
      setFilter("region", region);
    },
    [setFilter]
  );

  const handlePanelSelectPOI = useCallback(
    (slug: string) => handleSelectPOI(slug),
    [handleSelectPOI]
  );

  const clearFilters = useCallback(() => {
    setFilter("categories", []);
    setFilter("region", null);
  }, [setFilter]);

  const activeFilterCount =
    filters.categories.length + (filters.region ? 1 : 0);

  // Left edge swipe to open filter drawer
  useEffect(() => {
    if (isDesktop) return;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      if (startX < 20 && endX - startX > 60) {
        setIsFilterOpen(true);
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDesktop]);

  return (
    <div className="relative h-screen w-full">
      <Header
        onOpenFilter={isDesktop ? undefined : () => setIsFilterOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Map */}
      <div
        className="absolute inset-0 pt-14"
        style={isDesktop ? { paddingLeft: "384px" } : undefined}
      >
        <MapView
          data={filteredGeoJSON}
          viewState={viewState}
          onViewStateChange={(vs) => {
            zoomRef.current = vs.zoom;
            setViewState(vs);
          }}
          selectedPOI={selectedPOI}
          onSelectPOI={handleSelectPOI}
          mapRef={mapRef}
          isDesktop={isDesktop}
          userLocation={userLocation}
        />
      </div>

      {/* Panel */}
      {isDesktop ? (
        <SidePanel
          pois={filteredPOIs}
          selectedSlug={filters.selectedPOI}
          selectedCategories={filters.categories}
          selectedRegion={filters.region}
          searchResults={searchResults}
          onSearch={handleSearch}
          onToggleCategory={handleToggleCategory}
          onSelectRegion={handleSelectRegion}
          onSelectPOI={handlePanelSelectPOI}
        />
      ) : (
        <>
          <BottomSheet
            selectedPOI={selectedPOI}
            onDeselectPOI={() => handleSelectPOI(null)}
          />
          <GeolocateFAB
            mapRef={mapRef}
            bottomOffset={selectedPOI ? 220 : 140}
            onLocationFound={setUserLocation}
          />
          <FilterDrawer
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            selectedCategories={filters.categories}
            selectedRegion={filters.region}
            onToggleCategory={handleToggleCategory}
            onSelectRegion={handleSelectRegion}
            onClearFilters={clearFilters}
            pois={filteredPOIs}
            selectedSlug={filters.selectedPOI}
            searchResults={searchResults}
            onSearch={handleSearch}
            onSelectPOI={handlePanelSelectPOI}
          />
        </>
      )}
    </div>
  );
}

export default function MapShell() {
  return (
    <Suspense>
      <MapShellInner />
    </Suspense>
  );
}
