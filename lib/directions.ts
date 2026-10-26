// Opens the phone's native Maps app with directions to a given point.
// Uses device-native URL schemes first (opens turn-by-turn directly),
// falling back to Google's universal web URL if that scheme isn't
// available. No API key or billing needed — this just launches an
// app the user already has installed.

import { Linking, Platform } from "react-native";

export async function openDirectionsTo(
  latitude: number,
  longitude: number,
  label?: string
) {
  const destination = `${latitude},${longitude}`;

  const nativeUrl =
    Platform.OS === "ios"
      ? `maps://?daddr=${destination}&dirflg=d`
      : `google.navigation:q=${destination}&mode=d`;

  const canOpenNative = await Linking.canOpenURL(nativeUrl);
  if (canOpenNative) {
    await Linking.openURL(nativeUrl);
    return;
  }

  const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  await Linking.openURL(fallbackUrl);
}