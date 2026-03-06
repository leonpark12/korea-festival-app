import { memo } from "react";
import { Marker } from "react-map-gl/maplibre";
import type { POI } from "@/types/poi";

interface SelectedPOIMarkerProps {
  poi: POI;
}

export default memo(function SelectedPOIMarker({ poi }: SelectedPOIMarkerProps) {
  if (!poi.coordinates) return null;

  return (
    <Marker
      longitude={poi.coordinates.lng}
      latitude={poi.coordinates.lat}
      anchor="center"
    >
      <div className="selected-poi-pulse" aria-label={poi.name}>
        <span className="selected-poi-ring" />
        <span className="selected-poi-ring selected-poi-ring-delay" />
        <span className="selected-poi-dot" />
      </div>
    </Marker>
  );
});
