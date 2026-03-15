import { memo, useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
  poiLabelLayer,
  sparseLabelLayer,
} from "./map-layers";
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS, SPARSE_THRESHOLD } from "@/lib/constants";
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

  // 희소 데이터 판단: 서버 힌트 우선, 폴백으로 feature 개수 확인
  const isSparse = useMemo(
    () =>
      !isServerClustered &&
      (data.metadata?.sparse === true ||
        data.features.length < SPARSE_THRESHOLD),
    [data, isServerClustered]
  );

  // 서버사이드 region 클러스터 모드
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

  // 희소 데이터: 클러스터링 없이 개별 마커 + 라벨만 표시
  if (isSparse) {
    return (
      <Source
        key="sparse-points"
        id="pois"
        type="geojson"
        data={data}
        cluster={false}
      >
        <Layer {...unclusteredPointLayer} />
        <Layer {...sparseLabelLayer} />
      </Source>
    );
  }

  // 밀집 데이터: MapLibre 네이티브 클러스터링
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
