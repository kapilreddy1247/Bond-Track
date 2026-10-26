// Helpers for getting the Parent App's own device location (not the
// Child device's — this is the phone the parent is holding).

import * as Location from "expo-location";

export type Coords = { latitude: number; longitude: number };

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function watchMyLocation(
  onUpdate: (coords: Coords) => void
): Promise<() => void> {
  const subscription = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
    (loc) => onUpdate({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
  );

  return () => subscription.remove();
}

export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
