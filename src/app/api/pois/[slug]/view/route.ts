import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = checkRateLimit(request, "pois-view", {
    windowMs: 60_000,
    max: 60,
  });
  if (rateLimited) return rateLimited;

  const { slug } = await params;
  const db = await getDb();

  await Promise.all([
    db.collection("pois_kr").updateOne({ slug }, { $inc: { viewCount: 1 } }),
    db.collection("pois_en").updateOne({ slug }, { $inc: { viewCount: 1 } }),
  ]);

  return NextResponse.json({ success: true });
}
