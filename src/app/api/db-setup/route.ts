import { NextRequest, NextResponse } from "next/server";
import { setupDatabase } from "@/lib/db-setup";
import { checkRateLimit } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  // Rate limit: 1분에 3회
  const rateLimited = checkRateLimit(request, "db-setup", {
    windowMs: 60_000,
    max: 3,
  });
  if (rateLimited) return rateLimited;

  const secret = process.env.DB_SETUP_SECRET;
  if (!secret) {
    return NextResponse.json({
      error: "Setup disabled",
      debug: {
        hasSecret: !!secret,
        envKeys: Object.keys(process.env).filter(k => k.includes("DB_")),
      },
    }, { status: 403 });
  }

  // Authorization 헤더에서 Bearer 토큰 검증
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await setupDatabase();
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
