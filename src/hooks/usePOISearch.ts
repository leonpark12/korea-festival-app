"use client";

import { useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import type { POISummary } from "@/types/poi";

export function usePOISearch() {
  const locale = useLocale();
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (query: string, limit = 10): Promise<POISummary[]> => {
      if (!query.trim()) return [];

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/pois/search?locale=${locale}&q=${encodeURIComponent(query)}&limit=${limit}`,
          { signal: controller.signal }
        );
        return (await res.json()) as POISummary[];
      } catch {
        return [];
      }
    },
    [locale]
  );

  return { search };
}
