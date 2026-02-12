import type { MapViewState } from "@/types/map";

export const KOREA_CENTER: MapViewState = {
  longitude: 127.7669,
  latitude: 35.9078,
  zoom: 7,
};

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export const CLUSTER_MAX_ZOOM = 14;
export const CLUSTER_RADIUS = 50;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const SIDE_PANEL_WIDTH = 384; // w-96
