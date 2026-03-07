"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleLocale = () => {
    const next = locale === "ko" ? "en" : "ko";
    const search = searchParams.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;
    router.replace(fullPath, { locale: next });
  };

  return (
    <button
      onClick={toggleLocale}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      aria-label="Switch language"
    >
      {locale === "ko" ? "EN" : "KO"}
    </button>
  );
}
