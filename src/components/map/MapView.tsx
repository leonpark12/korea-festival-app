"use client";

import { useRef, useCallback, type RefObject } from "react";
import Map, { type MapRef, type MapMouseEvent } from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import ClusterSource from "./ClusterSource";
import MapControls from "./MapControls";
import POIPopup from "./POIPopup";
import UserLocationMarker from "./UserLocationMarker";
import { KOREA_CENTER, MAP_STYLE } from "@/lib/constants";
import type { MapViewState, UserLocation } from "@/types/map";
import type { POIGeoJSON, POI } from "@/types/poi";
import type { ViewportBounds } from "@/hooks/usePOIData";

interface MapViewProps {
  data: POIGeoJSON;
  viewState: MapViewState;
  onViewStateChange: (vs: MapViewState) => void;
  onViewportChange?: (vs: MapViewState, bounds: ViewportBounds | null) => void;
  selectedPOI: POI | null;
  onSelectPOI: (slug: string | null) => void;
  mapRef?: RefObject<MapRef | null>;
  isDesktop?: boolean;
  userLocation?: UserLocation | null;
}

function getBounds(map: maplibregl.Map): ViewportBounds {
  const bounds = map.getBounds();
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
}

export default function MapView({
  data,
  viewState,
  onViewStateChange,
  onViewportChange,
  selectedPOI,
  onSelectPOI,
  mapRef: externalRef,
  isDesktop = true,
  userLocation,
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
        const geometry = feature.geometry;
        if (geometry.type !== "Point") return;

        const clusterId = feature.properties.cluster_id;
        if (clusterId != null) {
          // MapLibre 네이티브 클러스터 → expansion zoom 조회
          const map = mapRef.current?.getMap();
          if (!map) return;
          const source = map.getSource("pois") as maplibregl.GeoJSONSource;

          source.getClusterExpansionZoom(clusterId).then((zoom) => {
            mapRef.current?.flyTo({
              center: geometry.coordinates as [number, number],
              zoom,
              duration: 500,
            });
          });
        } else {
          // 서버사이드 region 클러스터 → zoom 10으로 이동 (개별 POI 표시 시작점)
          mapRef.current?.flyTo({
            center: geometry.coordinates as [number, number],
            zoom: 10,
            duration: 500,
          });
        }
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

  // 맵 이동 완료 시 viewport bounds 전달 → 디바운스된 데이터 리로드
  const onMoveEnd = useCallback(() => {
    if (!onViewportChange) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const vs: MapViewState = {
      longitude: map.getCenter().lng,
      latitude: map.getCenter().lat,
      zoom: map.getZoom(),
    };
    onViewportChange(vs, getBounds(map));
  }, [onViewportChange]);

  // 맵 초기 로드 완료 시 viewport 데이터 로드
  const onLoad = useCallback(() => {
    if (!onViewportChange) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const vs: MapViewState = {
      longitude: map.getCenter().lng,
      latitude: map.getCenter().lat,
      zoom: map.getZoom(),
    };
    onViewportChange(vs, getBounds(map));
  }, [onViewportChange]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => {
        zoomRef.current = evt.viewState.zoom;
        onViewStateChange(evt.viewState);
      }}
      onMoveEnd={onMoveEnd}
      onLoad={onLoad}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={["clusters", "unclustered-point"]}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ width: "100%", height: "100%" }}
      minZoom={5.5}
      maxZoom={18}
      dragRotate={false}
      touchPitch={false}
      maxBounds={[
        [122, 32],
        [132, 40],
      ]}
      aria-label="한국 관광지 지도"
    >
      <ClusterSource data={data} />
      <MapControls showGeolocate={isDesktop} />
      {userLocation && <UserLocationMarker location={userLocation} />}
      {isDesktop && selectedPOI && (
        <POIPopup poi={selectedPOI} onClose={() => onSelectPOI(null)} />
      )}
    </Map>
  );
}
