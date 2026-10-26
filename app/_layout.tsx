import "../global.css";
import { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Sora_600SemiBold } from "@expo-google-fonts/sora";
import {
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { LanguageProvider } from "../lib/LanguageContext";
import { supabase } from "../lib/supabase";
import { registerForPushNotificationsAsync } from "../lib/notifications";

// Keep native splash visible until ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function prepareApp() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fire push registration in background without awaiting or blocking app load
          registerForPushNotificationsAsync(session.user.id).catch((err) =>
            console.error("Push registration error on startup:", err)
          );

          // Allow the root Stack tree to attach before redirecting
          setTimeout(() => {
            if (isMounted) {
              router.replace("/pair-device");
            }
          }, 150);
        }
      } catch (e) {
        console.error("Startup auth check failed:", e);
      } finally {
        if (isMounted) {
          setAppReady(true);
        }
      }
    }

    prepareApp();

    // Listen to manual sign in or sign out transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        registerForPushNotificationsAsync(session.user.id).catch(console.error);
        setTimeout(() => router.replace("/pair-device"), 100);
      } else if (event === "SIGNED_OUT") {
        setTimeout(() => router.replace("/"), 100);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Dismiss splash screen once fonts load (or error out) and auth check completes
  useEffect(() => {
    if ((fontsLoaded || fontError) && appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, appReady]);

  // Keep rendering background during font loading, but never crash on null
  if (!fontsLoaded && !fontError) {
    return <View className="flex-1 bg-[#102422]" />;
  }

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="pair-device" />
        <Stack.Screen name="home" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="auth/callback" />
      </Stack>
    </LanguageProvider>
  );
}