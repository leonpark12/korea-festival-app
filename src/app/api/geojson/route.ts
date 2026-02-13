import { NextRequest, NextResponse } from "next/server";
import { getGeoJSON } from "@/lib/data-loader";

export function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "ko";
  const data = getGeoJSON(locale);

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
