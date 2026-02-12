"use client";

import Map, { Marker } from "react-map-gl/maplibre";
import { MAP_STYLE } from "@/lib/constants";

interface SpotMiniMapProps {
  lng: number;
  lat: number;
  color: string;
}

export default function SpotMiniMap({ lng, lat, color }: SpotMiniMapProps) {
  return (
    <Map
      initialViewState={{ longitude: lng, latitude: lat, zoom: 13 }}
      mapStyle={MAP_STYLE}
      style={{ width: "100%", height: "100%" }}
      interactive={false}
      attributionControl={false}
    >
      <Marker longitude={lng} latitude={lat} anchor="center">
        <div
          className="h-4 w-4 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: color }}
        />
      </Marker>
    </Map>
  );
}
