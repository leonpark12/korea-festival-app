"use client";

import POIPreviewCard from "./POIPreviewCard";
import { BOTTOM_SHEET_SELECTED_HEIGHT } from "@/lib/constants";
import type { POI } from "@/types/poi";

interface BottomSheetProps {
  selectedPOI?: POI | null;
  onDeselectPOI?: () => void;
}

export default function BottomSheet({
  selectedPOI,
  onDeselectPOI,
}: BottomSheetProps) {
  if (!selectedPOI) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 rounded-t-2xl border-t border-border bg-white shadow-2xl lg:hidden"
      style={{ height: BOTTOM_SHEET_SELECTED_HEIGHT }}
    >
      <div className="flex h-full flex-col px-4 pt-3 pb-4">
        <POIPreviewCard
          poi={selectedPOI}
          onClose={() => onDeselectPOI?.()}
        />
      </div>
    </div>
  );
}
