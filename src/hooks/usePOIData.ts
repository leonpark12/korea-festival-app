"use client";

import { useState, useEffect } from "react";
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
  const [geojson, setGeojson] = useState<POIGeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const [sumRes, geoRes] = await Promise.all([
        fetch(`/api/pois?locale=${locale}`),
        fetch(`/api/geojson?locale=${locale}`),
      ]);

      if (cancelled) return;

      const [sumData, geoData] = await Promise.all([
        sumRes.json() as Promise<POISummary[]>,
        geoRes.json() as Promise<POIGeoJSON>,
      ]);

      if (cancelled) return;

      setSummaries(sumData);
      setGeojson(geoData);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { summaries, geojson: geojson ?? EMPTY_GEOJSON, isLoading };
}
