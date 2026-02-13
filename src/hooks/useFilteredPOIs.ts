"use client";

import { useMemo } from "react";
import type { POIGeoJSON, POISummary } from "@/types/poi";
import type { FilterState } from "@/types/map";

export function useFilteredGeoJSON(
  geojson: POIGeoJSON,
  filters: FilterState
): POIGeoJSON {
  return useMemo(() => {
    let features = geojson.features;

    if (filters.categories.length > 0) {
      features = features.filter((f) =>
        filters.categories.includes(f.properties.category)
      );
    }

    if (filters.region) {
      features = features.filter(
        (f) => f.properties.region === filters.region
      );
    }

    return { type: "FeatureCollection", features };
  }, [geojson, filters.categories, filters.region]);
}

export function useFilteredPOIs(
  pois: POISummary[],
  filters: FilterState
): POISummary[] {
  return useMemo(() => {
    let filtered = pois;

    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categories.includes(p.category)
      );
    }

    if (filters.region) {
      filtered = filtered.filter((p) => p.region === filters.region);
    }

    return filtered;
  }, [pois, filters.categories, filters.region]);
}
