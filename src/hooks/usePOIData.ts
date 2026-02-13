"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import type { POISummary, POIGeoJSON } from "@/types/poi";

interface POIData {
  summaries: POISummary[];
  geojson: POIGeoJSON;
  isLoading: boolean;
}

const EMPTY_GEOJSON: POIGeoJSON = { type: "FeatureCollection", features: [] };

export function usePOIData(): POIData {
  const locale = useLocale();
  const [summaries, setSummaries] = useState<POISummary[]>([]);
  const [geojson, setGeojson] = useState<POIGeoJSON>(EMPTY_GEOJSON);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      try {
        const [sumRes, geoRes] = await Promise.all([
          fetch(`/api/pois?locale=${locale}`, { signal: controller.signal }),
          fetch(`/api/geojson?locale=${locale}`, { signal: controller.signal }),
        ]);

        const [sumData, geoData] = await Promise.all([
          sumRes.json() as Promise<POISummary[]>,
          geoRes.json() as Promise<POIGeoJSON>,
        ]);

        setSummaries(sumData);
        setGeojson(geoData);
        setIsLoading(false);
      } catch {
        // aborted
      }
    }

    load();
    return () => {
      controller.abort();
    };
  }, [locale]);

  return useMemo(
    () => ({ summaries, geojson, isLoading }),
    [summaries, geojson, isLoading]
  );
}
