import { NavigationControl, GeolocateControl } from "react-map-gl/maplibre";

export default function MapControls() {
  return (
    <>
      <GeolocateControl
        position="bottom-right"
        trackUserLocation
        style={{ marginBottom: 80 }}
      />
      <NavigationControl position="bottom-right" showCompass={false} />
    </>
  );
}
