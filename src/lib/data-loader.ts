import { getDb } from "./mongodb";
import type { POI, POISummary, POIGeoJSON, Category, CategoryCardGroup, RegionCode } from "@/types/poi";
import type { WithId, Document } from "mongodb";

// ─── Category Mapping ───────────────────────────────────────────────

const CATEGORY_MAP_KR: Record<string, Category> = {
  역사관광: "culture",
  문화관광: "culture",
  자연관광: "nature",
  "축제/공연/행사": "festival",
  축제공연행사: "festival",
  숙박: "accommodation",
  레저스포츠: "leisure",
  쇼핑: "shopping",
  음식: "restaurant",
  체험관광: "attraction",
  추천코스: "attraction",
};

const CATEGORY_MAP_EN: Record<string, Category> = {
  "Historical Tourism": "culture",
  "Cultural Tourism": "culture",
  "Nature Tourism": "nature",
  "Festivals/Performances/Events": "festival",
  "Festivals/Events": "festival",
  Accommodation: "accommodation",
  "Leisure Sports": "leisure",
  Shopping: "shopping",
  Food: "restaurant",
  "Experiential Tourism": "attraction",
  "Recommended Course": "attraction",
};

function mapCategory(raw: string, locale: string): Category {
  const map = locale === "ko" ? CATEGORY_MAP_KR : CATEGORY_MAP_EN;
  return map[raw] ?? "attraction";
}

/**
 * 앱 카테고리 → MongoDB 원본 카테고리 역매핑
 * "culture" → ["역사관광", "문화관광"] (KR) / ["Historical Tourism", "Cultural Tourism"] (EN)
 */
function reverseMapCategories(appCategories: string[], locale: string): string[] {
  const map = locale === "ko" ? CATEGORY_MAP_KR : CATEGORY_MAP_EN;
  const result: string[] = [];
  for (const [raw, mapped] of Object.entries(map)) {
    if (appCategories.includes(mapped)) {
      result.push(raw);
    }
  }
  return result;
}

// ─── Helpers ────────────────────────────────────────────────────────

function abbreviateCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function collectionName(locale: string): string {
  return `pois_${locale === "en" ? "en" : "kr"}`;
}

const SUMMARY_PROJECTION = {
  _id: 0,
  id: 1,
  slug: 1,
  name: 1,
  address: 1,
  category: 1,
  region: 1,
  coordinates: 1,
} as const;

const FULL_PROJECTION = {
  _id: 0,
  id: 1,
  slug: 1,
  name: 1,
  address: 1,
  category: 1,
  region: 1,
  coordinates: 1,
  description: 1,
  images: 1,
  contact: 1,
  website: 1,
  tags: 1,
  updatedAt: 1,
} as const;

function docToPOI(doc: WithId<Document> | Document, locale: string): POI {
  return {
    id: doc.id as string,
    slug: doc.slug as string,
    name: doc.name as string,
    address: doc.address as string,
    category: mapCategory(doc.category as string, locale),
    region: doc.region as RegionCode,
    coordinates: doc.coordinates as { lat: number; lng: number },
    description: (doc.description as string) || undefined,
    images: (doc.images as string[]) || undefined,
    contact: (doc.contact as string) || undefined,
    website: (doc.website as string) || undefined,
    tags: (doc.tags as string[]) || undefined,
    updatedAt: doc.updatedAt as string,
  };
}

function docToSummary(doc: WithId<Document> | Document, locale: string): POISummary {
  return {
    id: doc.id as string,
    slug: doc.slug as string,
    name: doc.name as string,
    address: doc.address as string,
    category: mapCategory(doc.category as string, locale),
    region: doc.region as RegionCode,
    coordinates: doc.coordinates as { lat: number; lng: number },
  };
}

// ─── Public API ─────────────────────────────────────────────────────

export async function getAllPOIs(locale: string): Promise<POI[]> {
  const db = await getDb();
  const docs = await db
    .collection(collectionName(locale))
    .find({}, { projection: FULL_PROJECTION })
    .toArray();
  return docs.map((doc) => docToPOI(doc, locale));
}

export async function getAllPOISummaries(locale: string): Promise<POISummary[]> {
  const db = await getDb();
  const docs = await db
    .collection(collectionName(locale))
    .find({}, { projection: SUMMARY_PROJECTION })
    .toArray();
  return docs.map((doc) => docToSummary(doc, locale));
}

export async function getPOIBySlug(
  locale: string,
  slug: string
): Promise<POI | undefined> {
  const db = await getDb();
  const doc = await db
    .collection(collectionName(locale))
    .findOne({ slug }, { projection: FULL_PROJECTION });
  return doc ? docToPOI(doc, locale) : undefined;
}

export async function getAllSlugs(locale: string): Promise<string[]> {
  const db = await getDb();
  const docs = await db
    .collection(collectionName(locale))
    .find({}, { projection: { _id: 0, slug: 1 } })
    .toArray();
  return docs.map((doc) => doc.slug as string);
}

export async function getGeoJSON(locale: string): Promise<POIGeoJSON> {
  const db = await getDb();
  const docs = await db
    .collection(collectionName(locale))
    .find({}, { projection: SUMMARY_PROJECTION })
    .toArray();

  return {
    type: "FeatureCollection",
    features: docs.map((doc) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [
          (doc.coordinates as { lng: number }).lng,
          (doc.coordinates as { lat: number }).lat,
        ] as [number, number],
      },
      properties: {
        id: doc.id as string,
        slug: doc.slug as string,
        category: mapCategory(doc.category as string, locale),
        name: doc.name as string,
        region: doc.region as RegionCode,
      },
    })),
  };
}

/**
 * Viewport 기반 GeoJSON 조회 (Phase 2 핵심)
 * bbox: [west, south, east, north] (lng_min, lat_min, lng_max, lat_max)
 */
export async function getGeoJSONByBBox(
  locale: string,
  bbox: [number, number, number, number],
  filters?: { categories?: string[]; region?: string }
): Promise<POIGeoJSON> {
  const db = await getDb();
  const [west, south, east, north] = bbox;

  const query: Document = {
    location: {
      $geoWithin: {
        $geometry: {
          type: "Polygon",
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      },
    },
  };

  if (filters?.categories?.length) {
    // 앱 카테고리 → MongoDB 원본 카테고리로 역매핑
    const rawCategories = reverseMapCategories(filters.categories, locale);
    if (rawCategories.length) {
      query.category = { $in: rawCategories };
    }
  }
  if (filters?.region) {
    query.region = filters.region;
  }

  const docs = await db
    .collection(collectionName(locale))
    .find(query, { projection: SUMMARY_PROJECTION })
    .toArray();

  return {
    type: "FeatureCollection",
    features: docs.map((doc) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [
          (doc.coordinates as { lng: number }).lng,
          (doc.coordinates as { lat: number }).lat,
        ] as [number, number],
      },
      properties: {
        id: doc.id as string,
        slug: doc.slug as string,
        category: mapCategory(doc.category as string, locale),
        name: doc.name as string,
        region: doc.region as RegionCode,
      },
    })),
  };
}

/**
 * Region별 POI 수 집계 (저줌 레벨용 서버사이드 클러스터)
 */
export async function getRegionClusters(
  locale: string,
  filters?: { categories?: string[] }
): Promise<POIGeoJSON> {
  const db = await getDb();
  const match: Document = {};
  if (filters?.categories?.length) {
    // 앱 카테고리 → MongoDB 원본 카테고리로 역매핑
    const rawCategories = reverseMapCategories(filters.categories, locale);
    if (rawCategories.length) {
      match.category = { $in: rawCategories };
    }
  }

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $group: {
        _id: "$region",
        count: { $sum: 1 },
        lat: { $avg: "$coordinates.lat" },
        lng: { $avg: "$coordinates.lng" },
      },
    },
  ];

  const results = await db
    .collection(collectionName(locale))
    .aggregate(pipeline)
    .toArray();

  return {
    type: "FeatureCollection",
    features: results.map((r) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [r.lng as number, r.lat as number] as [number, number],
      },
      properties: {
        id: r._id as string,
        slug: r._id as string,
        category: "attraction" as Category,
        name: r._id as string,
        region: r._id as RegionCode,
        cluster: true,
        point_count: r.count as number,
        point_count_abbreviated: abbreviateCount(r.count as number),
      },
    })),
  };
}

export async function getNearbyPOIs(
  locale: string,
  lat: number,
  lng: number,
  excludeSlug: string,
  limit = 4
): Promise<POI[]> {
  const db = await getDb();
  const col = collectionName(locale);

  try {
    // $geoNear 사용 (location 필드 + 2dsphere 인덱스 필요)
    const docs = await db
      .collection(col)
      .aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "_dist",
            query: { slug: { $ne: excludeSlug } },
            spherical: true,
          },
        },
        { $limit: limit },
        { $project: { ...FULL_PROJECTION, _dist: 0 } },
      ])
      .toArray();
    return docs.map((doc) => docToPOI(doc, locale));
  } catch {
    // Fallback: 2dsphere 인덱스 없을 때 JS 정렬
    const all = await getAllPOIs(locale);
    return all
      .filter((poi) => poi.slug !== excludeSlug)
      .map((poi) => ({
        poi,
        dist: Math.hypot(
          poi.coordinates.lat - lat,
          poi.coordinates.lng - lng
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit)
      .map((item) => item.poi);
  }
}

/**
 * MongoDB 텍스트 검색 (Fuse.js 대체)
 */
/**
 * 카테고리별 카드 데이터 조회 (사이드패널용)
 * MongoDB aggregation으로 카테고리별 perCategory개 + 총 개수 반환
 */
export async function getCardsByCategory(
  locale: string,
  perCategory: number,
  bbox?: [number, number, number, number],
  filters?: { categories?: string[]; region?: string }
): Promise<{ groups: CategoryCardGroup[]; totalVisible: number }> {
  const db = await getDb();
  const catMap = locale === "ko" ? CATEGORY_MAP_KR : CATEGORY_MAP_EN;

  // $switch branches for category mapping
  const switchBranches = Object.entries(catMap).map(([raw, mapped]) => ({
    case: { $eq: ["$category", raw] },
    then: mapped,
  }));

  const match: Document = {};

  if (bbox) {
    const [west, south, east, north] = bbox;
    match.location = {
      $geoWithin: {
        $geometry: {
          type: "Polygon",
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      },
    };
  }

  if (filters?.categories?.length) {
    const rawCategories = reverseMapCategories(filters.categories, locale);
    if (rawCategories.length) {
      match.category = { $in: rawCategories };
    }
  }
  if (filters?.region) {
    match.region = filters.region;
  }

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $addFields: {
        appCategory: {
          $switch: {
            branches: switchBranches,
            default: "attraction",
          },
        },
      },
    },
    {
      $group: {
        _id: "$appCategory",
        total: { $sum: 1 },
        items: {
          $push: {
            id: "$id",
            slug: "$slug",
            name: "$name",
            address: "$address",
            region: "$region",
            coordinates: "$coordinates",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        total: 1,
        items: { $slice: ["$items", perCategory] },
      },
    },
    { $sort: { total: -1 as const } },
  ];

  const results = await db
    .collection(collectionName(locale))
    .aggregate(pipeline)
    .toArray();

  let totalVisible = 0;
  const groups: CategoryCardGroup[] = results.map((r) => {
    totalVisible += r.total as number;
    return {
      category: r.category as Category,
      total: r.total as number,
      items: (r.items as Document[]).map((item) => ({
        id: item.id as string,
        slug: item.slug as string,
        name: item.name as string,
        address: item.address as string,
        category: r.category as Category,
        region: item.region as RegionCode,
        coordinates: item.coordinates as { lat: number; lng: number },
      })),
    };
  });

  return { groups, totalVisible };
}

export async function searchPOIs(
  locale: string,
  query: string,
  limit = 10
): Promise<POISummary[]> {
  const db = await getDb();

  try {
    // $text 인덱스 사용 시도
    const docs = await db
      .collection(collectionName(locale))
      .find(
        { $text: { $search: query } },
        {
          projection: { ...SUMMARY_PROJECTION, score: { $meta: "textScore" } },
        }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .toArray();
    return docs.map((doc) => docToSummary(doc, locale));
  } catch {
    // Fallback: regex 검색
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await db
      .collection(collectionName(locale))
      .find(
        { $or: [{ name: regex }, { address: regex }, { tags: regex }] },
        { projection: SUMMARY_PROJECTION }
      )
      .limit(limit)
      .toArray();
    return docs.map((doc) => docToSummary(doc, locale));
  }
}
