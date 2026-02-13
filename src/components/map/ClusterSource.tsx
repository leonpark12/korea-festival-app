import { memo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
  poiLabelLayer,
} from "./map-layers";
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from "@/lib/constants";
import type { POIGeoJSON } from "@/types/poi";

interface ClusterSourceProps {
  data: POIGeoJSON;
}

export default memo(function ClusterSource({ data }: ClusterSourceProps) {
  return (
    <Source
      id="pois"
      type="geojson"
      data={data}
      cluster={true}
      clusterMaxZoom={CLUSTER_MAX_ZOOM}
      clusterRadius={CLUSTER_RADIUS}
    >
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredPointLayer} />
      <Layer {...poiLabelLayer} />
    </Source>
  );
});
