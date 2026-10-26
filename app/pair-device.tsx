// Pair Device screen (Phase 1.5.2) — manual device-ID entry.
//
// Live BLE scan/connect to the Parent Device is deferred until firmware is
// proven on real hardware (see CONTEXT.md, Section 3/4). For now the user
// types the ID printed on their Parent Device (e.g. "PARENT_DEVICE_001")
// and we link it to their account via the `claim_kit` Postgres function.
//
// STATUS: NOT PHYSICALLY TESTED.

import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

const TABLET_BREAKPOINT = 768;

export default function PairDeviceScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Radar Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 1600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.1, duration: 1600, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: 1600, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [pulseAnim, opacityAnim]);

  async function handlePair() {
    setErrorMessage(null);

    const trimmed = deviceId.trim().toUpperCase();
    if (!trimmed) {
      setErrorMessage("Enter the device ID printed on your Parent Device.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("claim_kit", {
      kit_device_id: trimmed,
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    if (!data) {
      setErrorMessage("No device found with that ID. Double-check and try again.");
      return;
    }

    router.replace("/home");
  }

  function handleTriggerBleScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3500);
  }

  const formFields = (
    <View className="w-full">
      <Text className="font-display text-2xl font-bold text-ink mb-1">Device Setup</Text>
      <Text className="font-body text-muted text-xs mb-4">
        Locate the unique identification tag on your hardware kit.
      </Text>

      <LabeledField label="Device ID">
        <TextInput
          value={deviceId}
          onChangeText={setDeviceId}
          placeholder="PARENT_DEVICE_001"
          placeholderTextColor="#9AA6A7"
          autoCapitalize="characters"
          autoCorrect={false}
          className="font-body text-ink text-sm py-1.5 font-semibold"
        />
      </LabeledField>

      {errorMessage && (
        <Text className="font-body text-[#EF4444] mb-3 text-xs">{errorMessage}</Text>
      )}

      <LinearGradient
        colors={["#E8A33D", "#D98A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 16 }}
      >
        <Pressable
          onPress={handlePair}
          disabled={loading}
          className="py-3.5 items-center active:opacity-85 shadow-sm"
        >
          {loading ? (
            <ActivityIndicator color="#16262B" />
          ) : (
            <Text className="font-body-medium text-[#16262B] font-bold text-sm">Pair device</Text>
          )}
        </Pressable>
      </LinearGradient>

      <View className="flex-row items-center my-4">
        <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
        <Text className="font-body text-muted text-[11px] mx-3 uppercase tracking-wider">or scan nearby</Text>
        <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
      </View>

      <Pressable
        onPress={handleTriggerBleScan}
        disabled={isScanning}
        className="flex-row items-center justify-center gap-2 border border-[#E2E8F0] bg-white rounded-2xl py-3 shadow-sm active:opacity-80 mb-2.5"
      >
        {isScanning ? (
          <>
            <ActivityIndicator color="#2E6F6E" size="small" />
            <Text className="font-body-medium text-ink text-xs font-semibold">
              Scanning for hardware beacons...
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="bluetooth" size={18} color="#2E6F6E" />
            <Text className="font-body-medium text-ink text-xs font-semibold">
              Scan for Nearby Device
            </Text>
          </>
        )}
      </Pressable>

      <Pressable className="items-center py-2" onPress={() => router.replace("/home")}>
        <Text className="font-body text-muted text-xs">Skip for now</Text>
      </Pressable>
    </View>
  );

  // ---- iPad / Tablet split view (Preserved untouched) ----
  if (isTablet) {
    return (
      <View className="flex-1 flex-row bg-[#F9FBFB]">
        <LinearGradient
          colors={["#102422", "#19433F", "#2E6F6E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: "42%", padding: 36, justifyContent: "space-between", alignItems: "center" }}
        >
          <View className="w-full flex-row justify-start">
            {router.canGoBack() && (
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center shadow-sm"
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          <View className="items-center justify-center">
            <View style={{ width: 180, height: 180, alignItems: "center", justifyContent: "center" }}>
              <Animated.View
                style={{
                  position: "absolute",
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  borderWidth: 2,
                  borderColor: "#10B981",
                  transform: [{ scale: pulseAnim }],
                  opacity: opacityAnim,
                }}
              />
              <View className="w-20 h-20 rounded-full bg-[#19433F] border border-[#10B981]/50 items-center justify-center shadow-sm">
                <Ionicons name="radio-outline" size={38} color="#10B981" />
              </View>
            </View>

            <Text className="font-display text-3xl font-bold text-white tracking-wide text-center mt-4">
              Pair your device
            </Text>
            <Text className="font-body text-white/70 text-sm mt-2 text-center max-w-[280px]">
              Enter the ID printed on your Parent Device to link it to your account.
            </Text>
          </View>

          <Text className="font-body text-white/40 text-xs">Hardware Setup Assistant</Text>
        </LinearGradient>

        <View className="flex-1 items-center justify-center p-8 bg-[#F9FBFB]">
          <View className="w-full max-w-[420px] bg-white p-8 rounded-[28px] border border-[#E2E8F0] shadow-sm">
            {formFields}
          </View>
        </View>
      </View>
    );
  }

  // Dynamic status bar offset for Android notch/punch-hole
  const androidStatusBarHeight = StatusBar.currentHeight ?? 24;
  const topInset = Platform.OS === "android" ? androidStatusBarHeight + 10 : 48;

  // ---- Mobile Phone Layout with Keyboard Adaptation ----
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#102422]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        {/* Top Header: 45% when closed, compact bar when typing */}
        <LinearGradient
          colors={["#102422", "#19433F", "#2E6F6E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: keyboardVisible ? undefined : 0.45,
            paddingTop: topInset,
            paddingHorizontal: 20,
            paddingBottom: keyboardVisible ? 24 : 28,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View className="w-full flex-row justify-start">
            {router.canGoBack() ? (
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                className="w-9 h-9 rounded-full bg-white/10 items-center justify-center shadow-sm"
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View style={{ height: 28 }} />
            )}
          </View>

          {!keyboardVisible && (
            <View className="items-center justify-center">
              <View
                style={{
                  width: 120,
                  height: 120,
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 2,
                }}
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 2,
                    borderColor: "#10B981",
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                  }}
                />
                <View className="w-18 h-18 rounded-full bg-[#19433F] border border-[#10B981]/50 items-center justify-center shadow-sm p-4">
                  <Ionicons name="radio-outline" size={32} color="#10B981" />
                </View>
              </View>

              <Text className="font-display text-2xl font-bold text-white tracking-wide mt-2 text-center">
                Pair your device
              </Text>
              <Text className="font-body text-white/70 text-xs mt-0.5 text-center max-w-[260px]">
                Enter the ID printed on your Parent Device to link it to your account.
              </Text>
            </View>
          )}

          {!keyboardVisible && <View style={{ height: 4 }} />}
        </LinearGradient>

        {/* Bottom Sheet: 55% when closed, expands to full height when typing */}
        <View
          style={{
            flex: keyboardVisible ? 1 : 0.55,
            marginTop: -20,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: "#F9FBFB",
          }}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formFields}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-3.5 bg-white border border-[#E2E8F0] rounded-2xl px-4 py-2 shadow-sm">
      <Text className="font-body text-muted text-[10px] mb-0.5 font-medium uppercase tracking-wider">{label}</Text>
      {children}
    </View>
  );
}