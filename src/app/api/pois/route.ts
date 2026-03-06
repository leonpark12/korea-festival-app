import { NextRequest, NextResponse } from "next/server";
import { getAllPOISummaries } from "@/lib/data-loader";
import { parseLocale, checkRateLimit } from "@/lib/api-utils";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export async function GET(request: NextRequest) {
  // Rate limit: 1분에 60회
  const rateLimited = checkRateLimit(request, "pois", {
    windowMs: 60_000,
    max: 60,
  });
  if (rateLimited) return rateLimited;

  const sp = request.nextUrl.searchParams;
  const locale = parseLocale(sp.get("locale"));

  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(sp.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );

  const summaries = await getAllPOISummaries(locale);
  const total = summaries.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const items = summaries.slice(offset, offset + limit);

  return NextResponse.json(
    { items, total, page, limit, totalPages },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
