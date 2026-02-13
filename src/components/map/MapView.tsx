"use client";

import { useRef, useCallback, type RefObject } from "react";
import Map, { type MapRef, type MapMouseEvent } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import ClusterSource from "./ClusterSource";
import MapControls from "./MapControls";
import POIPopup from "./POIPopup";
import { KOREA_CENTER, MAP_STYLE } from "@/lib/constants";
import type { MapViewState } from "@/types/map";
import type { POIGeoJSON, POI } from "@/types/poi";

interface MapViewProps {
  data: POIGeoJSON;
  viewState: MapViewState;
  onViewStateChange: (vs: MapViewState) => void;
  selectedPOI: POI | null;
  onSelectPOI: (slug: string | null) => void;
  mapRef?: RefObject<MapRef | null>;
  isDesktop?: boolean;
}

export default function MapView({
  data,
  viewState,
  onViewStateChange,
  selectedPOI,
  onSelectPOI,
  mapRef: externalRef,
  isDesktop = true,
}: MapViewProps) {
  const internalRef = useRef<MapRef>(null);
  const mapRef = externalRef ?? internalRef;
  const zoomRef = useRef(viewState.zoom);

  const onClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        onSelectPOI(null);
        return;
      }

      if (feature.properties?.cluster) {
        const map = mapRef.current?.getMap();
        if (!map) return;
        const source = map.getSource("pois") as maplibregl.GeoJSONSource;
        const clusterId = feature.properties.cluster_id;

        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geometry = feature.geometry;
          if (geometry.type !== "Point") return;

          mapRef.current?.flyTo({
            center: geometry.coordinates as [number, number],
            zoom,
            duration: 500,
          });
        });
      } else if (feature.properties?.slug) {
        onSelectPOI(feature.properties.slug);
        const geometry = feature.geometry;
        if (geometry.type === "Point") {
          mapRef.current?.flyTo({
            center: geometry.coordinates as [number, number],
            zoom: Math.max(zoomRef.current, 13),
            duration: 500,
          });
        }
      }
    },
    [onSelectPOI]
  );

  const onMouseEnter = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = "pointer";
  }, []);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = "";
  }, []);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => {
        zoomRef.current = evt.viewState.zoom;
        onViewStateChange(evt.viewState);
      }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={["clusters", "unclustered-point"]}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ width: "100%", height: "100%" }}
      maxBounds={[
        [122, 32],
        [132, 40],
      ]}
      aria-label="한국 관광지 지도"
    >
      <ClusterSource data={data} />
      <MapControls showGeolocate={isDesktop} />
      {isDesktop && selectedPOI && (
        <POIPopup poi={selectedPOI} onClose={() => onSelectPOI(null)} />
      )}
    </Map>
  );
}
