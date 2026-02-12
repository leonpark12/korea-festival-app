import type { LayerProps } from "react-map-gl/maplibre";
import { CATEGORY_COLORS } from "@/lib/categories";

export const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "pois",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#51bbd6",
      10,
      "#f1f075",
      30,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};

export const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "pois",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 14,
    "text-font": ["Noto Sans Bold", "Noto Sans Regular"],
  },
  paint: {
    "text-color": "#333333",
  },
};

export const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: "pois",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": [
      "match",
      ["get", "category"],
      ...CATEGORY_COLORS.flat(),
      "#888888",
    ] as unknown as string,
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      5, 5,
      10, 8,
      15, 12,
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};
