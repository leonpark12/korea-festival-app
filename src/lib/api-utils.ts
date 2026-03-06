import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./rate-limit";

/** 허용된 locale 값 */
const VALID_LOCALES = new Set(["ko", "en"]);

/** locale 파라미터를 검증하고 안전한 값 반환 */
export function parseLocale(raw: string | null): "ko" | "en" {
  if (raw && VALID_LOCALES.has(raw)) return raw as "ko" | "en";
  return "ko";
}

/** 클라이언트 IP 추출 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Rate limit 체크 → 초과 시 429 Response 반환, 통과 시 null */
export function checkRateLimit(
  request: NextRequest,
  routeKey: string,
  options: { windowMs: number; max: number }
): NextResponse | null {
  const ip = getClientIP(request);
  const result = rateLimit(ip, routeKey, options);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((result.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": String(options.max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
