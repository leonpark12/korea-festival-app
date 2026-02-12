import { Source, Layer } from "react-map-gl/mapbox";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from "./map-layers";
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from "@/lib/constants";
import type { POIGeoJSON } from "@/types/poi";

interface ClusterSourceProps {
  data: POIGeoJSON;
}

export default function ClusterSource({ data }: ClusterSourceProps) {
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
    </Source>
  );
}
