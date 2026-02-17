import { NextResponse } from "next/server";
import { setupDatabase } from "@/lib/db-setup";

export async function POST() {
  const secret = process.env.DB_SETUP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Setup disabled" }, { status: 403 });
  }

  try {
    const results = await setupDatabase();
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
