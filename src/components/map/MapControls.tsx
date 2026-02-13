import { NavigationControl, GeolocateControl } from "react-map-gl/maplibre";

interface MapControlsProps {
  showGeolocate?: boolean;
}

export default function MapControls({ showGeolocate = true }: MapControlsProps) {
  return (
    <>
      {showGeolocate && (
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          style={{ marginBottom: 80 }}
        />
      )}
      <NavigationControl position="bottom-right" showCompass={false} />
    </>
  );
}
