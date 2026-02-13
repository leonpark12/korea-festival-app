export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface ClusterFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string;
  };
}

export interface UserLocation {
  longitude: number;
  latitude: number;
  accuracy: number;
}

export interface FilterState {
  categories: string[];
  region: string | null;
  query: string;
  selectedPOI: string | null;
}
