"use client";

import { useState, useEffect, useRef } from "react";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import { CATEGORY_MAP } from "@/lib/categories";
import type { POISummary } from "@/types/poi";

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchResults: POISummary[];
  onSelect: (slug: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SearchBar({
  onSearch,
  searchResults,
  onSelect,
  isOpen: controlledOpen,
  onOpenChange,
}: SearchBarProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const open = controlledOpen ?? isOpen;
  const setOpen = onOpenChange ?? setIsOpen;

  // onSearch를 ref로 저장하여 useEffect 의존성에서 제거 → 무한루프 방지
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    onSearchRef.current(query);
  }, [query]);

  return (
    <div className="relative">
      <Command
        className="rounded-xl border border-border bg-white shadow-sm"
        shouldFilter={false}
        label={t("placeholder")}
      >
        <Command.Input
          value={query}
          onValueChange={setQuery}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {open && query.length > 0 && (
          <Command.List className="max-h-60 overflow-y-auto border-t border-border">
            {searchResults.length === 0 ? (
              <Command.Empty className="p-4 text-center text-sm text-muted-foreground">
                {t("noResults")}
              </Command.Empty>
            ) : (
              searchResults.map((poi) => {
                const cat = CATEGORY_MAP[poi.category];
                return (
                  <Command.Item
                    key={poi.id}
                    value={poi.slug}
                    onSelect={() => {
                      onSelect(poi.slug);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted data-[selected=true]:bg-muted"
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {poi.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {poi.address}
                      </p>
                    </div>
                  </Command.Item>
                );
              })
            )}
          </Command.List>
        )}
      </Command>
    </div>
  );
}
