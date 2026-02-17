import { NextRequest, NextResponse } from "next/server";
import { searchPOIs } from "@/lib/data-loader";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const locale = sp.get("locale") ?? "ko";
  const q = sp.get("q") ?? "";
  const limit = parseInt(sp.get("limit") ?? "10", 10);

  const headers = {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  };

  if (!q.trim()) {
    return NextResponse.json([], { headers });
  }

  const results = await searchPOIs(locale, q, limit);
  return NextResponse.json(results, { headers });
}
