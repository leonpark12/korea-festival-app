"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import MapView from "./MapView";
import SidePanel from "../panel/SidePanel";
import BottomSheet from "../panel/BottomSheet";
import Header from "../layout/Header";
import { useFilteredGeoJSON, useFilteredPOIs } from "@/hooks/useFilteredPOIs";
import { useQueryParams } from "@/hooks/useQueryParams";
import { usePOISearch } from "@/hooks/usePOISearch";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { KOREA_CENTER } from "@/lib/constants";
import type { MapViewState } from "@/types/map";
import type { POI, POIGeoJSON } from "@/types/poi";
import type { MapRef } from "react-map-gl/maplibre";

import poisJson from "@/data/pois.json";
import geojsonData from "@/data/pois.geo.json";

const allPois = poisJson as POI[];
const geojson = geojsonData as unknown as POIGeoJSON;

function MapShellInner() {
  const { filters, setFilter } = useQueryParams();
  const isDesktop = useIsDesktop();
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<MapViewState>(KOREA_CENTER);
  const [searchResults, setSearchResults] = useState<POI[]>([]);

  const filteredGeoJSON = useFilteredGeoJSON(geojson, filters);
  const filteredPOIs = useFilteredPOIs(allPois, filters);
  const { search } = usePOISearch(allPois);

  const selectedPOI =
    allPois.find((p) => p.slug === filters.selectedPOI) ?? null;

  const handleSearch = useCallback(
    (query: string) => {
      setFilter("query", query || null);
      const results = search(query);
      setSearchResults(results);
    },
    [search, setFilter]
  );

  const handleSelectPOI = useCallback(
    (slug: string | null) => {
      setFilter("selectedPOI", slug);
      if (slug) {
        const poi = allPois.find((p) => p.slug === slug);
        if (poi) {
          mapRef.current?.flyTo({
            center: [poi.coordinates.lng, poi.coordinates.lat],
            zoom: Math.max(viewState.zoom, 13),
            duration: 500,
          });
        }
      }
    },
    [setFilter, viewState.zoom]
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

  return (
    <div className="relative h-screen w-full">
      <Header />

      {/* Map */}
      <div
        className="absolute inset-0 pt-14"
        style={isDesktop ? { paddingLeft: "384px" } : undefined}
      >
        <MapView
          data={filteredGeoJSON}
          viewState={viewState}
          onViewStateChange={setViewState}
          selectedPOI={selectedPOI}
          onSelectPOI={handleSelectPOI}
          mapRef={mapRef}
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
          onSelectPOI={(slug) => handleSelectPOI(slug)}
        />
      ) : (
        <BottomSheet
          pois={filteredPOIs}
          selectedSlug={filters.selectedPOI}
          selectedCategories={filters.categories}
          selectedRegion={filters.region}
          searchResults={searchResults}
          onSearch={handleSearch}
          onToggleCategory={handleToggleCategory}
          onSelectRegion={handleSelectRegion}
          onSelectPOI={(slug) => handleSelectPOI(slug)}
        />
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
