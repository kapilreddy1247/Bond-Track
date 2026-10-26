import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Foreground presentation behavior compatible with modern expo-notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  // Real physical device check
  if (!Device.isDevice) {
    console.warn("[Push] Push notifications require a physical device.");
    return null;
  }

  // 1. Android Notification Channel (Required for Android 8.0+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E8A33D",
      sound: "default",
    });
  }

  // 2. Check and request push permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Notifications Disabled",
      "Please enable notifications in your phone's settings to receive location tracking alerts."
    );
    return null;
  }

  // 3. Resolve Project ID for EAS standalone builds
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  let pushToken: string;
  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    pushToken = tokenResponse.data;
    console.log("[Push] Generated Expo Push Token:", pushToken);
  } catch (err: any) {
    console.error("[Push] Error generating push token:", err);
    Alert.alert("Push Token Error", err?.message ?? "Failed to obtain push token.");
    return null;
  }

  // 4. Upsert token into user_devices table
  try {
    const { error } = await supabase.from("user_devices").upsert(
      {
        user_id: userId,
        push_token: pushToken,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "push_token" }
    );

    if (error) {
      console.error("[Push] Error saving token to Supabase:", error);
      Alert.alert("Database Error", "Failed to save push token: " + error.message);
    } else {
      console.log("[Push] Token successfully synced to user_devices.");
    }
  } catch (err) {
    console.error("[Push] Network exception while persisting token:", err);
  }

  return pushToken;
}