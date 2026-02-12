"use client";

import { Link } from "@/i18n/navigation";

export default function SpotError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-5xl">🗺️</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          페이지를 불러올 수 없습니다
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          잠시 후 다시 시도하거나, 지도로 돌아가세요.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            지도로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
