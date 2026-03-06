/**
 * 간단한 인메모리 Rate Limiter (Vercel serverless 인스턴스당)
 * 완전한 분산 rate limiting은 아니지만 단일 인스턴스 남용 방지
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 오래된 엔트리 주기적 정리 (메모리 누수 방지)
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

interface RateLimitOptions {
  /** 윈도우 기간 (ms) */
  windowMs: number;
  /** 윈도우당 최대 요청 수 */
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  ip: string,
  routeKey: string,
  options: RateLimitOptions
): RateLimitResult {
  cleanup();

  const key = `${routeKey}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.max - 1, resetAt };
  }

  entry.count++;
  if (entry.count > options.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: options.max - entry.count,
    resetAt: entry.resetAt,
  };
}
