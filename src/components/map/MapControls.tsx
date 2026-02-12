import { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";

export default function MapControls() {
  return (
    <>
      <GeolocateControl
        position="bottom-right"
        trackUserLocation
        showUserHeading
        style={{ marginBottom: 80 }}
      />
      <NavigationControl position="bottom-right" showCompass={false} />
    </>
  );
}
