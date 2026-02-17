import { memo, useMemo } from "react";
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
  // 서버사이드 region 클러스터인지 감지 (cluster 속성 존재 여부)
  const isServerClustered = useMemo(
    () =>
      data.features.length > 0 &&
      data.features[0]?.properties?.cluster === true,
    [data]
  );

  // key를 사용하여 cluster 모드 전환 시 Source를 강제 재생성
  // MapLibre는 기존 source의 cluster 설정을 동적으로 변경할 수 없음
  if (isServerClustered) {
    return (
      <Source
        key="server-clusters"
        id="pois"
        type="geojson"
        data={data}
        cluster={false}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
      </Source>
    );
  }

  return (
    <Source
      key="native-clusters"
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
