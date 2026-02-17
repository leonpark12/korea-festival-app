import { NextRequest, NextResponse } from "next/server";
import { getAllPOISummaries } from "@/lib/data-loader";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const locale = sp.get("locale") ?? "ko";

  const summaries = await getAllPOISummaries(locale);

  return NextResponse.json(summaries, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
