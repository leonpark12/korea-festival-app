"use client";

import { useTranslations } from "next-intl";
import Logo from "./Logo";
import LocaleSwitcher from "./LocaleSwitcher";

interface HeaderProps {
  onOpenFilter?: () => void;
  activeFilterCount?: number;
}

export default function Header({ onOpenFilter, activeFilterCount = 0 }: HeaderProps) {
  const t = useTranslations("header");

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex h-14 items-center justify-between bg-white/90 px-4 shadow-sm backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-2">
        {onOpenFilter && (
          <button
            onClick={onOpenFilter}
            aria-label={t("openFilter")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
        <Logo />
      </div>
      <LocaleSwitcher />
    </header>
  );
}
