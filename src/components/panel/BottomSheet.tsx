"use client";

import POIPreviewCard from "./POIPreviewCard";
import type { POI } from "@/types/poi";

interface BottomSheetProps {
  selectedPOI?: POI | null;
  onDeselectPOI?: () => void;
}

export default function BottomSheet({
  selectedPOI,
  onDeselectPOI,
}: BottomSheetProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 rounded-t-2xl border-t border-border bg-white shadow-2xl lg:hidden"
      style={{ height: selectedPOI ? 200 : 120 }}
    >
      <div className="flex h-full flex-col px-4 pt-3 pb-4">
        {selectedPOI ? (
          <POIPreviewCard
            poi={selectedPOI}
            onClose={() => onDeselectPOI?.()}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20">
            <span className="text-xs text-muted-foreground/40">Ad Space</span>
          </div>
        )}
      </div>
    </div>
  );
}
