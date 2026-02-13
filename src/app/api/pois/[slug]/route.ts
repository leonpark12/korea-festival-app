import { NextRequest, NextResponse } from "next/server";
import { getPOIBySlug } from "@/lib/data-loader";

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "ko";

  return params.then(({ slug }) => {
    const poi = getPOIBySlug(locale, slug);
    if (!poi) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(poi, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  });
}
