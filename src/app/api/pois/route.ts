import { NextRequest, NextResponse } from "next/server";
import { getAllPOISummaries } from "@/lib/data-loader";
import { parseLocale, checkRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  // Rate limit: 1분에 60회
  const rateLimited = checkRateLimit(request, "pois", {
    windowMs: 60_000,
    max: 60,
  });
  if (rateLimited) return rateLimited;

  const sp = request.nextUrl.searchParams;
  const locale = parseLocale(sp.get("locale"));

  const summaries = await getAllPOISummaries(locale);

  return NextResponse.json(summaries, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
