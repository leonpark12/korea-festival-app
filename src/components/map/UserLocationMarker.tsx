"use client";

import { Marker } from "react-map-gl/maplibre";
import type { UserLocation } from "@/types/map";

interface UserLocationMarkerProps {
  location: UserLocation;
}

export default function UserLocationMarker({ location }: UserLocationMarkerProps) {
  return (
    <Marker longitude={location.longitude} latitude={location.latitude}>
      <div className="relative flex items-center justify-center">
        <span className="absolute h-7 w-7 animate-ping rounded-full bg-blue-400/40" />
        <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-md" />
      </div>
    </Marker>
  );
}
