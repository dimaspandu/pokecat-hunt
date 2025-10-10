import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Smoothly fly the map view to the user's current position.
 */
export default function FlyToUser({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 15, { duration: 1.5 });
  }, [position, map]);
  return null;
}