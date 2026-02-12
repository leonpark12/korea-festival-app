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

export interface POI {
  id: string;
  slug: string;
  category: Category;
  coordinates: {
    lat: number;
    lng: number;
  };
  name: {
    ko: string;
    en: string;
  };
  address: {
    ko: string;
    en: string;
  };
  description?: {
    ko: string;
    en: string;
  };
  region: RegionCode;
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
  name_ko: string;
  name_en: string;
  region: RegionCode;
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

export interface Region {
  code: RegionCode;
  name: {
    ko: string;
    en: string;
  };
  center: [number, number]; // [lng, lat]
  bbox: [number, number, number, number]; // [west, south, east, north]
}
