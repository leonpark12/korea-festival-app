import { NextRequest, NextResponse } from "next/server";
import { searchPOIs } from "@/lib/data-loader";
import { parseLocale, checkRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  // Rate limit: 1분에 60회
  const rateLimited = checkRateLimit(request, "pois-search", {
    windowMs: 60_000,
    max: 60,
  });
  if (rateLimited) return rateLimited;

  const sp = request.nextUrl.searchParams;
  const locale = parseLocale(sp.get("locale"));
  const q = sp.get("q") ?? "";
  const limit = Math.max(1, Math.min(parseInt(sp.get("limit") ?? "10", 10) || 10, 50));

  const headers = {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  };

  if (!q.trim()) {
    return NextResponse.json([], { headers });
  }

  const results = await searchPOIs(locale, q, limit);
  return NextResponse.json(results, { headers });
}
