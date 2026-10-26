// Placeholder landing screen for the Google OAuth redirect
// (exp://.../--/auth/callback). It exists only so Expo Router shows a
// spinner instead of briefly flashing "Unmatched Route" while
// lib/googleAuth.ts finishes processing the session and redirects
// to /pair-device.

import { View, ActivityIndicator } from "react-native";

export default function AuthCallbackScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator color="#2E6F6E" />
    </View>
  );
}