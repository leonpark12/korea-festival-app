"use client";

import { useMemo, useRef, useCallback } from "react";
import Fuse from "fuse.js";
import type { POI } from "@/types/poi";

export function usePOISearch(pois: POI[]) {
  const fuseRef = useRef<Fuse<POI> | null>(null);

  const index = useMemo(() => {
    const fuse = new Fuse(pois, {
      keys: [
        { name: "name.ko", weight: 2 },
        { name: "name.en", weight: 2 },
        { name: "address.ko", weight: 1 },
        { name: "address.en", weight: 1 },
        { name: "tags", weight: 1.5 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 1,
    });
    fuseRef.current = fuse;
    return fuse;
  }, [pois]);

  const search = useCallback(
    (query: string, limit = 10): POI[] => {
      if (!query.trim()) return [];
      return index.search(query, { limit }).map((r) => r.item);
    },
    [index]
  );

  return { search };
}
