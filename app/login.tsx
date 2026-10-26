// Login screen (Phase 1.5.1) — email + password auth via Supabase.
//
// STATUS: NOT PHYSICALLY TESTED. Not run in a simulator/device, and
// supabase.ts still points at placeholder project credentials.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

const TABLET_BREAKPOINT = 768;

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className={
          isTablet
            ? "flex-1 flex-row"
            : "flex-1 justify-center px-6"
        }
      >
        {isTablet && <BrandPanel />}

        <View
          className={
            isTablet
              ? "flex-1 items-center justify-center px-10"
              : ""
          }
        >
          <View className={isTablet ? "w-full max-w-[380px]" : "w-full"}>
            {!isTablet && <CompactBrandHeader />}

            <Text className="font-display text-2xl text-ink mb-1">
              Welcome back
            </Text>
            <Text className="font-body text-muted mb-8">
              Log in to keep watch over your Bond-Track devices.
            </Text>

            <Field label="Email">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#5B6E70"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                className="font-body text-ink bg-surface border border-border rounded-xl px-4 py-3"
              />
            </Field>

            <Field label="Password">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#5B6E70"
                secureTextEntry
                autoComplete="password"
                className="font-body text-ink bg-surface border border-border rounded-xl px-4 py-3"
              />
            </Field>

            {errorMessage && (
              <Text className="font-body text-danger mb-4">
                {errorMessage}
              </Text>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className="bg-accent rounded-xl py-4 items-center mt-2 active:opacity-80"
            >
              {loading ? (
                <ActivityIndicator color="#16262B" />
              ) : (
                <Text className="font-body-medium text-ink">Log in</Text>
              )}
            </Pressable>

            <Pressable className="mt-5 items-center">
              <Text className="font-body text-brand">
                Don't have an account? Create one
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="font-body-medium text-ink mb-1.5">{label}</Text>
      {children}
    </View>
  );
}

function CompactBrandHeader() {
  return (
    <View className="mb-10">
      <Text className="font-display text-3xl text-brand">Bond-Track</Text>
    </View>
  );
}

// Quiet brand panel shown alongside the form on tablet-width screens.
function BrandPanel() {
  return (
    <View className="flex-1 bg-brand items-start justify-end p-12">
      <Text className="font-display text-4xl text-white mb-3">Bond-Track</Text>
      <Text className="font-body text-white/80 max-w-[320px]">
        Stay connected to what matters, without needing to check.
      </Text>
    </View>
  );
}
