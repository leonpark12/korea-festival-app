"use client";

import { useTranslations } from "next-intl";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          {t("error")}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {error.message || "Something went wrong"}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
