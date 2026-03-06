import { NextRequest, NextResponse } from "next/server";
import { getPOIBySlug } from "@/lib/data-loader";
import { parseLocale, checkRateLimit } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limit: 1분에 120회
  const rateLimited = checkRateLimit(request, "pois-slug", {
    windowMs: 60_000,
    max: 120,
  });
  if (rateLimited) return rateLimited;

  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const { slug } = await params;

  const poi = await getPOIBySlug(locale, slug);
  if (!poi) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(poi, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
