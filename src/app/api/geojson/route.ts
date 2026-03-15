import { NextRequest, NextResponse } from "next/server";
import { getGeoJSON, getGeoJSONByBBox, getRegionClusters, getFilteredCount } from "@/lib/data-loader";
import { parseLocale, checkRateLimit } from "@/lib/api-utils";
import { SPARSE_THRESHOLD } from "@/lib/constants";

export async function GET(request: NextRequest) {
  // Rate limit: 1분에 120회
  const rateLimited = checkRateLimit(request, "geojson", {
    windowMs: 60_000,
    max: 120,
  });
  if (rateLimited) return rateLimited;

  const sp = request.nextUrl.searchParams;
  const locale = parseLocale(sp.get("locale"));
  const bbox = sp.get("bbox");
  const zoom = parseFloat(sp.get("zoom") ?? "7");

  // 카테고리/지역 필터
  const categoriesParam = sp.get("categories");
  const categories = categoriesParam ? categoriesParam.split(",") : undefined;
  const region = sp.get("region") || undefined;
  const filters = categories || region ? { categories, region } : undefined;

  try {
    let data;
    let totalCount: number | undefined;
    let sparse = false;

    if (bbox) {
      const parts = bbox.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n) && isFinite(n))) {
        const [west, south, east, north] = parts as [number, number, number, number];

        if (zoom < 10) {
          // 필터가 있으면 sparse 여부 먼저 확인
          if (filters) {
            totalCount = await getFilteredCount(locale, filters);
            sparse = totalCount < SPARSE_THRESHOLD;
          }

          if (sparse) {
            // 희소 데이터: 개별 POI를 직접 반환 (region 클러스터 건너뜀)
            data = await getGeoJSON(locale, filters);
          } else {
            data = await getRegionClusters(locale, filters);
          }
        } else {
          data = await getGeoJSONByBBox(locale, [west, south, east, north], filters);
          // zoom >= 10에서도 sparse 힌트 제공
          totalCount = data.features.length;
          sparse = totalCount < SPARSE_THRESHOLD;
        }
      }
    }

    if (!data) {
      data = await getGeoJSON(locale);
    }

    // metadata 추가
    if (totalCount !== undefined) {
      data = { ...data, metadata: { totalCount, sparse } };
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": bbox
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[geojson API] error:", error);
    // fallback: 전체 GeoJSON 반환
    try {
      const fallback = await getGeoJSON(locale);
      return NextResponse.json(fallback);
    } catch (fallbackError) {
      console.error("[geojson API] fallback error:", fallbackError);
      return NextResponse.json(
        { type: "FeatureCollection", features: [] },
        { status: 500 }
      );
    }
  }
}
