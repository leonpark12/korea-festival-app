export type Category =
  | "attraction"
  | "restaurant"
  | "accommodation"
  | "shopping"
  | "festival"
  | "culture"
  | "nature"
  | "leisure";

export type RegionCode =
  | "seoul"
  | "busan"
  | "daegu"
  | "incheon"
  | "gwangju"
  | "daejeon"
  | "ulsan"
  | "sejong"
  | "gyeonggi"
  | "gangwon"
  | "chungbuk"
  | "chungnam"
  | "jeonbuk"
  | "jeonnam"
  | "gyeongbuk"
  | "gyeongnam"
  | "jeju";

export interface POISummary {
  id: string;
  slug: string;
  name: string;
  address: string;
  category: Category;
  region: RegionCode;
  coordinates: { lat: number; lng: number };
}

export interface POI extends POISummary {
  description?: string;
  images?: string[];
  contact?: string;
  website?: string;
  tags?: string[];
  updatedAt: string;
}

export interface POIGeoJSONProperties {
  id: string;
  slug: string;
  category: Category;
  name: string;
  region: RegionCode;
  /** 서버사이드 region 클러스터 전용 */
  cluster?: boolean;
  point_count?: number;
  point_count_abbreviated?: string;
}

export interface POIGeoJSON {
  type: "FeatureCollection";
  features: POIFeature[];
}

export interface POIFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: POIGeoJSONProperties;
}

export interface CategoryCardGroup {
  category: Category;
  total: number;
  items: POISummary[];
}

export interface Region {
  code: RegionCode;
  name: {
    ko: string;
    en: string;
  };
  center: [number, number]; // [lng, lat]
  bbox: [number, number, number, number]; // [west, south, east, north]
}
