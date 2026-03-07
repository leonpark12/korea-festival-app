import { cache } from "react";
import { getDb } from "./mongodb";
import type { POI, POISummary, NearbyPOI, POIGeoJSON, Category, CategoryCardGroup, RegionCode, POIIntroItem, POIInfoItem, POIPetInfo } from "@/types/poi";
import regionsData from "@/data/regions.json";
import type { WithId, Document } from "mongodb";

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
  appCategory: 1,
  region: 1,
  coordinates: 1,
  thumbnail: 1,
};

const FULL_PROJECTION = {
  _id: 0,
  id: 1,
  slug: 1,
  name: 1,
  address: 1,
  appCategory: 1,
  region: 1,
  coordinates: 1,
  description: 1,
  images: 1,
  contact: 1,
  website: 1,
  tags: 1,
  updatedAt: 1,
  mlevel: 1,
  intro: 1,
  info: 1,
  pet: 1,
  detailPetUpdated: 1,
};

const NEARBY_PROJECTION = {
  _id: 0,
  id: 1,
  slug: 1,
  name: 1,
  address: 1,
  appCategory: 1,
  region: 1,
  coordinates: 1,
  thumbnail: 1,
  description: 1,
};

function docToPOI(doc: WithId<Document> | Document): POI {
  return {
    id: doc.id as string,
    slug: doc.slug as string,
    name: doc.name as string,
    address: doc.address as string,
    category: (doc.appCategory as Category) ?? "attraction",
    region: doc.region as RegionCode,
    coordinates: doc.coordinates as { lat: number; lng: number },
    thumbnail: (doc.thumbnail as string) || undefined,
    description: (doc.description as string) || undefined,
    images: (doc.images as string[]) || undefined,
    contact: (doc.contact as string) || undefined,
    website: (doc.website as string) || undefined,
    tags: (doc.tags as string[]) || undefined,
    updatedAt: doc.updatedAt as string,
    mlevel: (doc.mlevel as number) || undefined,
    intro: (doc.intro as POIIntroItem[]) || undefined,
    info: (doc.info as POIInfoItem[]) || undefined,
    pet: (doc.pet as POIPetInfo) || undefined,
    detailPetUpdated: (doc.detailPetUpdated as boolean) || undefined,
  };
}

function docToSummary(doc: WithId<Document> | Document): POISummary {
  return {
    id: doc.id as string,
    slug: doc.slug as string,
    name: doc.name as string,
    address: doc.address as string,
    category: (doc.appCategory as Category) ?? "attraction",
    region: doc.region as RegionCode,
    coordinates: doc.coordinates as { lat: number; lng: number },
    thumbnail: (doc.thumbnail as string) || undefined,
  };
}

// ─── Public API ─────────────────────────────────────────────────────

export async function getAllPOIs(locale: string): Promise<POI[]> {
  const db = await getDb();
  const docs = await db
    .collection(collectionName(locale))
    .find({}, { projection: FULL_PROJECTION })
    .toArray();
  return docs.map((doc) => docToPOI(doc));
}

export async function getAllPOISummaries(locale: string): Promise<POISummary[]> {
  const db = await getDb();
  const docs = await db
    .collection(collectionName(locale))
    .find({}, { projection: SUMMARY_PROJECTION })
    .toArray();
  return docs.map((doc) => docToSummary(doc));
}

export const getPOIBySlug = cache(async (
  locale: string,
  slug: string
): Promise<POI | undefined> => {
  const db = await getDb();
  const doc = await db
    .collection(collectionName(locale))
    .findOne({ slug }, { projection: FULL_PROJECTION });
  return doc ? docToPOI(doc) : undefined;
});

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
        category: (doc.appCategory as Category) ?? "attraction",
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
    query.appCategory = { $in: filters.categories };
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
        category: (doc.appCategory as Category) ?? "attraction",
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
    match.appCategory = { $in: filters.categories };
  }

  // regions.json의 center 좌표를 룩업 맵으로 구축
  const regionCenterMap = new Map(
    regionsData.map((r) => [r.code, r.center as [number, number]])
  );

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $group: {
        _id: "$region",
        count: { $sum: 1 },
      },
    },
  ];

  const results = await db
    .collection(collectionName(locale))
    .aggregate(pipeline)
    .toArray();

  return {
    type: "FeatureCollection",
    features: results
      .filter((r) => regionCenterMap.has(r._id as string))
      .map((r) => {
        const center = regionCenterMap.get(r._id as string)!;
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: center,
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
        };
      }),
  };
}

function docToNearbyPOI(doc: WithId<Document> | Document, distanceMeters?: number): NearbyPOI {
  return {
    ...docToSummary(doc),
    description: (doc.description as string) || undefined,
    distance: distanceMeters,
  };
}

export async function getNearbyPOIs(
  locale: string,
  lat: number,
  lng: number,
  excludeSlug: string,
  limit = 4
): Promise<NearbyPOI[]> {
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
        { $project: { ...NEARBY_PROJECTION, _dist: 1 } },
      ])
      .toArray();
    return docs.map((doc) => docToNearbyPOI(doc, doc._dist as number));
  } catch {
    // Fallback: 2dsphere 인덱스 없을 때 JS 정렬 + Haversine 거리 계산
    const db2 = await getDb();
    const allDocs = await db2
      .collection(col)
      .find({ slug: { $ne: excludeSlug } }, { projection: NEARBY_PROJECTION })
      .toArray();

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    return allDocs
      .map((doc) => {
        const coords = doc.coordinates as { lat: number; lng: number };
        return { doc, dist: haversine(lat, lng, coords.lat, coords.lng) };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit)
      .map((item) => docToNearbyPOI(item.doc, item.dist));
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
    match.appCategory = { $in: filters.categories };
  }
  if (filters?.region) {
    match.region = filters.region;
  }

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
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
            thumbnail: "$thumbnail",
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
        thumbnail: (item.thumbnail as string) || undefined,
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
  const col = collectionName(locale);

  try {
    // $text 인덱스 사용 시도
    const docs = await db
      .collection(col)
      .find(
        { $text: { $search: query } },
        {
          projection: { ...SUMMARY_PROJECTION, score: { $meta: "textScore" } },
        }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .toArray();

    // $text 결과가 있으면 반환, 없으면 regex fallback
    if (docs.length > 0) {
      return docs.map((doc) => docToSummary(doc));
    }
  } catch {
    // $text 인덱스 없을 때 → regex fallback
  }

  // Fallback: regex 부분 매칭 검색
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const docs = await db
    .collection(col)
    .find(
      { $or: [{ name: regex }, { address: regex }, { tags: regex }] },
      { projection: SUMMARY_PROJECTION }
    )
    .limit(limit)
    .toArray();
  return docs.map((doc) => docToSummary(doc));
}
