// Login screen — VARIANT B (Phase 1.5.1 A/B comparison against login.tsx).
//
// Structural pattern: gradient hero header + white card overlapping it,
// following the reference layout the user shared. Same auth logic as
// Variant A (Supabase email/password) — this file only differs visually.
//
// STATUS: NOT PHYSICALLY TESTED. Requires `expo-linear-gradient` and
// `@expo/vector-icons` (bundled with Expo) to be installed.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

const TABLET_BREAKPOINT = 768;

export default function LoginScreenVariantB() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/"); // destination home route not built yet (Phase 1.5.2+)
  }

  const topBar = (color: string, mutedColor: string) => (
    <View className="flex-row items-center justify-between">
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color={color} />
      </Pressable>
      <Pressable onPress={() => router.push("/signup")}>
        <Text style={{ color: mutedColor }} className="font-body text-xs">
          Don't have an account?{" "}
          <Text style={{ color }} className="font-body-medium">
            Create one
          </Text>
        </Text>
      </Pressable>
    </View>
  );

  const form = (
    <>
      <Text className="font-display text-xl text-ink mb-1">Welcome back</Text>
      <Text className="font-body text-muted mb-6">
        Enter your details to continue.
      </Text>

      <LabeledField label="Email address">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#5B6E70"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          className="font-body text-ink text-sm"
        />
      </LabeledField>

      <View className="mb-4 bg-surface border border-border rounded-xl px-4 py-2 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-body text-muted text-[10px] mb-0.5">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#5B6E70"
            secureTextEntry={!showPassword}
            autoComplete="password"
            className="font-body text-ink text-sm"
          />
        </View>
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
          <Text className="font-body text-brand text-xs">
            {showPassword ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      {errorMessage && (
        <Text className="font-body text-danger mb-3 text-sm">{errorMessage}</Text>
      )}

      <LinearGradient
        colors={["#E8A33D", "#D98A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 12 }}
      >
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="py-4 items-center active:opacity-80"
        >
          {loading ? (
            <ActivityIndicator color="#16262B" />
          ) : (
            <Text className="font-body-medium text-ink">Sign in</Text>
          )}
        </Pressable>
      </LinearGradient>

      <Pressable className="items-center mt-3 mb-5">
        <Text className="font-body text-brand text-xs">Forgot your password?</Text>
      </Pressable>

      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-[1px] bg-border" />
        <Text className="font-body text-muted text-[11px] mx-3">Or continue with</Text>
        <View className="flex-1 h-[1px] bg-border" />
      </View>

      <View className="flex-row gap-3">
        <SocialButton label="Google" />
        <SocialButton label="Apple" />
      </View>
    </>
  );

  // ---- iPad layout: side-by-side gradient panel + card, no overlap trick ----
  if (isTablet) {
    return (
      <KeyboardAvoidingView className="flex-1 flex-row bg-white">
        <LinearGradient
          colors={["#2E6F6E", "#1B4A49"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 0.42, padding: 24, justifyContent: "space-between" }}
        >
          {topBar("#FFFFFF", "rgba(255,255,255,0.8)")}
          <View>
            <Text className="font-display text-3xl text-white mb-2">Bond-Track</Text>
            <Text className="font-body text-white/80 max-w-[260px]">
              Stay connected to what matters, without needing to check.
            </Text>
          </View>
        </LinearGradient>

        <View className="flex-1 items-center justify-center px-10">
          <View className="w-full max-w-[380px]">{form}</View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ---- Phone layout: gradient hero header + overlapping white card ----
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#2E6F6E", "#1B4A49"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 260, paddingHorizontal: 20, paddingTop: 16 }}
        >
          {topBar("#FFFFFF", "rgba(255,255,255,0.8)")}
          <View className="flex-1 justify-center">
            <Text className="font-display text-3xl text-white">Bond-Track</Text>
          </View>
        </LinearGradient>

        <View
          className="flex-1 bg-white px-6 pt-6"
          style={{ marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          {form}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-3 bg-surface border border-border rounded-xl px-4 py-2">
      <Text className="font-body text-muted text-[10px] mb-0.5">{label}</Text>
      {children}
    </View>
  );
}

function SocialButton({ label }: { label: string }) {
  return (
    <Pressable className="flex-1 border border-border rounded-xl py-3 items-center active:opacity-70">
      <Text className="font-body text-ink text-sm">{label}</Text>
    </Pressable>
  );
}
