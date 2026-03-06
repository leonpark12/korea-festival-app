import { NextRequest, NextResponse } from "next/server";
import { getCardsByCategory } from "@/lib/data-loader";
import { parseLocale, checkRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  // Rate limit: 1분에 120회
  const rateLimited = checkRateLimit(request, "pois-cards", {
    windowMs: 60_000,
    max: 120,
  });
  if (rateLimited) return rateLimited;

  const sp = request.nextUrl.searchParams;
  const locale = parseLocale(sp.get("locale"));
  const bbox = sp.get("bbox");
  const zoom = parseFloat(sp.get("zoom") ?? "7");
  const perCategory = Math.max(1, Math.min(parseInt(sp.get("per_category") ?? "5", 10) || 5, 20));

  // 카테고리/지역 필터
  const categoriesParam = sp.get("categories");
  const categories = categoriesParam ? categoriesParam.split(",") : undefined;
  const region = sp.get("region") || undefined;
  const filters = categories || region ? { categories, region } : undefined;

  try {
    let parsedBbox: [number, number, number, number] | undefined;

    if (bbox && zoom >= 10) {
      const parts = bbox.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n) && isFinite(n))) {
        parsedBbox = parts as [number, number, number, number];
      }
    }

    const data = await getCardsByCategory(locale, perCategory, parsedBbox, filters);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": bbox
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[pois/cards API] error:", error);
    return NextResponse.json(
      { groups: [], totalVisible: 0 },
      { status: 500 }
    );
  }
}
