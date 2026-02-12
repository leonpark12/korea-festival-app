"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === "ko" ? "en" : "ko";
    router.replace(pathname, { locale: next });
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
