"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface SpotGalleryProps {
  images: string[];
  poiName: string;
}

export default function SpotGallery({ images, poiName }: SpotGalleryProps) {
  const t = useTranslations("spot");
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  const handleError = useCallback((index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index));
  }, []);

  const validImages = images.filter((_, i) => !failedIndexes.has(i));

  if (validImages.length === 0) return null;

  return (
    <section className="border-t border-border px-4 pt-4 sm:px-6 sm:pt-6">
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        {t("gallery")}
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          {validImages.length}
        </span>
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin">
        {images.map((src, index) =>
          failedIndexes.has(index) ? null : (
            <div
              key={index}
              className="relative shrink-0 snap-start overflow-hidden rounded-lg bg-muted"
              style={{ width: 240, height: 180 }}
            >
              <Image
                src={src}
                alt={`${poiName} ${index + 1}`}
                fill
                unoptimized
                loading="lazy"
                sizes="240px"
                className="object-cover"
                onError={() => handleError(index)}
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}
