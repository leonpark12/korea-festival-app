import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import { getAllPOISummaries } from "@/lib/data-loader";
import type { POISummary } from "@/types/poi";

const fuseCache = new Map<string, Fuse<POISummary>>();

function getFuse(locale: string): Fuse<POISummary> {
  let fuse = fuseCache.get(locale);
  if (!fuse) {
    const summaries = getAllPOISummaries(locale);
    fuse = new Fuse(summaries, {
      keys: [
        { name: "name", weight: 2 },
        { name: "address", weight: 1 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 1,
    });
    fuseCache.set(locale, fuse);
  }
  return fuse;
}

export function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const locale = sp.get("locale") ?? "ko";
  const q = sp.get("q") ?? "";
  const limit = parseInt(sp.get("limit") ?? "10", 10);

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const fuse = getFuse(locale);
  const results = fuse.search(q, { limit }).map((r) => r.item);

  return NextResponse.json(results);
}
