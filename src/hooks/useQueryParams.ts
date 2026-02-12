"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { FilterState } from "@/types/map";

export function useQueryParams(): {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string | string[] | null) => void;
  clearFilters: () => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterState = {
    categories: searchParams.get("cat")?.split(",").filter(Boolean) ?? [],
    region: searchParams.get("region") ?? null,
    query: searchParams.get("q") ?? "",
    selectedPOI: searchParams.get("poi") ?? null,
  };

  const setFilter = useCallback(
    (key: keyof FilterState, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || (Array.isArray(value) && value.length === 0) || value === "") {
        if (key === "categories") params.delete("cat");
        else if (key === "region") params.delete("region");
        else if (key === "query") params.delete("q");
        else if (key === "selectedPOI") params.delete("poi");
      } else {
        if (key === "categories" && Array.isArray(value)) {
          params.set("cat", value.join(","));
        } else if (key === "region") {
          params.set("region", value as string);
        } else if (key === "query") {
          params.set("q", value as string);
        } else if (key === "selectedPOI") {
          params.set("poi", value as string);
        }
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}
