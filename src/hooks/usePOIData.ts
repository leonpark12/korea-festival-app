"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import useSWR from "swr";
import { useLocale } from "next-intl";
import type { CategoryCardGroup, POIGeoJSON } from "@/types/poi";
import type { MapViewState } from "@/types/map";

export interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface CardsResponse {
  groups: CategoryCardGroup[];
  totalVisible: number;
}

interface POIData {
  cardGroups: CategoryCardGroup[];
  totalVisible: number;
  geojson: POIGeoJSON;
  isLoading: boolean;
  onViewportChange: (vs: MapViewState, bounds: ViewportBounds | null) => void;
}

const EMPTY_GEOJSON: POIGeoJSON = { type: "FeatureCollection", features: [] };
const EMPTY_GROUPS: CategoryCardGroup[] = [];
const DEBOUNCE_MS = 300;

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Viewport + SWR 기반 POI 데이터 훅
 * - geojson: 지도 마커용 (viewport 기반)
 * - cardGroups: 사이드패널 카드용 (카테고리별 5개, viewport 기반)
 * - keepPreviousData로 이전 데이터 유지 → 깜빡임 방지
 */
export function usePOIData(filters?: {
  categories?: string[];
  region?: string | null;
}): POIData {
  const locale = useLocale();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // viewport key를 state로 관리 → 변경 시 SWR key 변경 → 자동 refetch
  const [viewportKey, setViewportKey] = useState("");

  // 필터 파라미터 문자열
  const filterStr = useMemo(() => {
    const parts: string[] = [];
    if (filters?.categories?.length) {
      parts.push(`categories=${filters.categories.join(",")}`);
    }
    if (filters?.region) {
      parts.push(`region=${filters.region}`);
    }
    return parts.join("&");
  }, [filters?.categories, filters?.region]);

  // GeoJSON SWR key (viewport + filters)
  const geoKey = viewportKey
    ? `/api/geojson?locale=${locale}&${viewportKey}${filterStr ? `&${filterStr}` : ""}`
    : null;

  // Cards SWR key (viewport + filters + per_category)
  const cardsKey = viewportKey
    ? `/api/pois/cards?locale=${locale}&${viewportKey}${filterStr ? `&${filterStr}` : ""}&per_category=5`
    : `/api/pois/cards?locale=${locale}${filterStr ? `&${filterStr}` : ""}&per_category=5`;

  const { data: geojson, isLoading: geoLoading } = useSWR<POIGeoJSON>(
    geoKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  const { data: cardsData, isLoading: cardsLoading } = useSWR<CardsResponse>(
    cardsKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  const onViewportChange = useCallback(
    (vs: MapViewState, bounds: ViewportBounds | null) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (bounds) {
          const zoom = Math.floor(vs.zoom);
          const w = bounds.west.toFixed(4);
          const s = bounds.south.toFixed(4);
          const e = bounds.east.toFixed(4);
          const n = bounds.north.toFixed(4);
          setViewportKey(`bbox=${w},${s},${e},${n}&zoom=${zoom}`);
        } else {
          setViewportKey("");
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  return useMemo(
    () => ({
      cardGroups: cardsData?.groups ?? EMPTY_GROUPS,
      totalVisible: cardsData?.totalVisible ?? 0,
      geojson: geojson ?? EMPTY_GEOJSON,
      isLoading: geoLoading || cardsLoading,
      onViewportChange,
    }),
    [cardsData, geojson, geoLoading, cardsLoading, onViewportChange]
  );
}
