"use client";

import { useState, useCallback, type RefObject } from "react";
import { useTranslations } from "next-intl";
import type { MapRef } from "react-map-gl/maplibre";
import type { UserLocation } from "@/types/map";

type FABState = "idle" | "loading" | "error";

interface GeolocateFABProps {
  mapRef: RefObject<MapRef | null>;
  bottomOffset?: number;
  onLocationFound?: (loc: UserLocation) => void;
}

export default function GeolocateFAB({
  mapRef,
  bottomOffset = 140,
  onLocationFound,
}: GeolocateFABProps) {
  const t = useTranslations("map");
  const [state, setState] = useState<FABState>("idle");

  const handleClick = useCallback(() => {
    if (state === "loading") return;
    if (!navigator.geolocation) {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
      return;
    }

    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude, accuracy } = pos.coords;
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 800,
        });
        onLocationFound?.({ longitude, latitude, accuracy });
        setState("idle");
      },
      () => {
        setState("error");
        setTimeout(() => setState("idle"), 2000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [mapRef, state]);

  return (
    <button
      onClick={handleClick}
      aria-label={t("myLocation")}
      className="fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all active:scale-95 lg:hidden"
      style={{ bottom: bottomOffset }}
    >
      {state === "loading" ? (
        <svg
          className="h-5 w-5 animate-spin text-primary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : state === "error" ? (
        <svg
          className="h-5 w-5 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      )}
    </button>
  );
}
