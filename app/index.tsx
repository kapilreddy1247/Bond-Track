import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { Link } from "expo-router";
import { supabase } from "../lib/supabase";
import { signInWithGoogle } from "../lib/googleAuth";
import { signInWithGitHub } from "../lib/githubAuth";
import { useAppLanguage, type SupportedLang } from "../lib/LanguageContext";

const TABLET_BREAKPOINT = 768;

const LANGUAGES: { code: SupportedLang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "te", label: "TE" },
];

export default function LoginScreen() {
  const { lang, setLang, t } = useAppLanguage();
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
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

  async function handleLogin() {
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(t.login.fillAllFields);
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
    // Navigation to /pair-device is managed centrally by the onAuthStateChange observer in _layout.tsx
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Navigation to /pair-device is managed centrally by the onAuthStateChange observer in _layout.tsx
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGitHubSignIn() {
    setErrorMessage(null);
    setGithubLoading(true);
    try {
      await signInWithGitHub();
      // Navigation to /pair-device is managed centrally by the onAuthStateChange observer in _layout.tsx
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "GitHub sign-in failed.");
    } finally {
      setGithubLoading(false);
    }
  }

  const languagePill = (
    <View className="flex-row items-center bg-white/15 rounded-full p-0.5 border border-white/20">
      {LANGUAGES.map((item) => {
        const active = lang === item.code;
        return (
          <Pressable
            key={item.code}
            onPress={() => setLang(item.code)}
            className={`px-2.5 py-1 rounded-full ${
              active ? "bg-[#E8A33D]" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-body text-[11px] font-bold ${
                active ? "text-[#102422]" : "text-white/80"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const topBar = (color: string, mutedColor: string) => (
    <View className="flex-row items-center justify-between w-full">
      {languagePill}
      <Link href="/signup" asChild>
        <Pressable className="bg-white/15 px-3.5 py-1.5 rounded-full">
          <Text style={{ color: mutedColor }} className="font-body text-xs">
            {t.login.noAccount}{" "}
            <Text style={{ color }} className="font-body-medium font-semibold">
              {t.login.createAccountLink}
            </Text>
          </Text>
        </Pressable>
      </Link>
    </View>
  );

  // ---- iPad / Tablet Layout ----
  if (isTablet) {
    return (
      <View className="flex-1 flex-row bg-[#F9FBFB]">
        {/* Left Fixed Panel */}
        <LinearGradient
          colors={["#102422", "#19433F", "#2E6F6E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: "42%", padding: 36, justifyContent: "space-between" }}
        >
          {topBar("#FFFFFF", "rgba(255,255,255,0.85)")}

          <View>
            <View className="w-16 h-16 rounded-2xl bg-[#E8A33D]/20 items-center justify-center mb-4">
              <Ionicons name="radio" size={32} color="#E8A33D" />
            </View>
            <Text className="font-display text-4xl font-bold text-white mb-2 tracking-wide">
              Bond-Track
            </Text>
            <Text className="font-body text-white/80 max-w-[320px] leading-relaxed text-sm">
              {t.login.tagline}
            </Text>
          </View>
          <Text className="font-body text-white/40 text-xs">
            Bond-Track Companion Platform
          </Text>
        </LinearGradient>

        {/* Right Form Area */}
        <View className="flex-1 bg-[#F9FBFB]">
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
              paddingVertical: 32,
              paddingBottom: keyboardVisible ? 280 : 32,
            }}
          >
            <View className="w-full max-w-[420px] bg-white p-8 rounded-[28px] border border-[#E2E8F0] shadow-sm">
              <LoginForm
                t={t}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                errorMessage={errorMessage}
                loading={loading}
                googleLoading={googleLoading}
                githubLoading={githubLoading}
                onLogin={handleLogin}
                onGoogleSignIn={handleGoogleSignIn}
                onGitHubSignIn={handleGitHubSignIn}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  const androidStatusBarHeight = StatusBar.currentHeight ?? 24;
  const topInset = Platform.OS === "android" ? androidStatusBarHeight + 10 : 48;

  // ---- Mobile Phone Layout ----
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#102422]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        <LinearGradient
          colors={["#102422", "#19433F", "#2E6F6E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: keyboardVisible ? undefined : 0.45,
            paddingTop: topInset,
            paddingHorizontal: 20,
            paddingBottom: keyboardVisible ? 20 : 28,
            justifyContent: "space-between",
          }}
        >
          {topBar("#FFFFFF", "rgba(255,255,255,0.85)")}

          {!keyboardVisible && (
            <View className="items-center justify-center pb-2">
              <View className="w-14 h-14 rounded-2xl bg-[#E8A33D]/20 items-center justify-center mb-2 shadow-sm border border-[#E8A33D]/30">
                <Ionicons name="radio" size={28} color="#E8A33D" />
              </View>
              <Text className="font-display text-2xl font-bold text-white tracking-wide">
                Bond-Track
              </Text>
              <Text className="font-body text-white/70 text-xs mt-0.5">
                {t.login.subtitle}
              </Text>
            </View>
          )}

          {!keyboardVisible && <View style={{ height: 4 }} />}
        </LinearGradient>

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
            <LoginForm
              t={t}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              errorMessage={errorMessage}
              loading={loading}
              googleLoading={googleLoading}
              githubLoading={githubLoading}
              onLogin={handleLogin}
              onGoogleSignIn={handleGoogleSignIn}
              onGitHubSignIn={handleGitHubSignIn}
            />
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function LoginForm({
  t,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errorMessage,
  loading,
  googleLoading,
  githubLoading,
  onLogin,
  onGoogleSignIn,
  onGitHubSignIn,
}: any) {
  return (
    <View className="w-full">
      <Text className="font-display text-2xl font-bold text-ink mb-1">
        {t.login.welcomeBack}
      </Text>
      <Text className="font-body text-muted text-xs mb-4">
        {t.login.subtitle}
      </Text>

      <View className="mb-3.5 bg-white border border-[#E2E8F0] rounded-2xl px-4 py-2 shadow-sm">
        <Text className="font-body text-muted text-[10px] mb-0.5 font-medium uppercase tracking-wider">
          {t.login.emailLabel}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t.login.emailPlaceholder}
          placeholderTextColor="#9AA6A7"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          className="font-body text-ink text-sm py-1.5"
        />
      </View>

      <View className="mb-3.5 bg-white border border-[#E2E8F0] rounded-2xl px-4 py-2 shadow-sm flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-body text-muted text-[10px] mb-0.5 font-medium uppercase tracking-wider">
            {t.login.passwordLabel}
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t.login.passwordPlaceholder}
            placeholderTextColor="#9AA6A7"
            secureTextEntry={!showPassword}
            autoComplete="password"
            className="font-body text-ink text-sm py-1.5"
          />
        </View>
        <Pressable onPress={() => setShowPassword((v: boolean) => !v)} hitSlop={8}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#5B6E70"
          />
        </Pressable>
      </View>

      {errorMessage && (
        <Text className="font-body text-[#EF4444] mb-2.5 text-xs">{errorMessage}</Text>
      )}

      <LinearGradient
        colors={["#E8A33D", "#D98A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 16 }}
      >
        <Pressable
          onPress={onLogin}
          disabled={loading}
          className="py-3.5 items-center active:opacity-85 shadow-sm"
        >
          {loading ? (
            <ActivityIndicator color="#16262B" />
          ) : (
            <Text className="font-body-medium text-[#16262B] font-bold text-sm">
              {t.login.signInButton}
            </Text>
          )}
        </Pressable>
      </LinearGradient>

      <Pressable className="items-center mt-2.5 active:opacity-70">
        <Text className="font-body-medium text-[#2E6F6E] text-xs font-semibold">
          {t.login.forgotPassword}
        </Text>
      </Pressable>

      <View className="flex-row items-center my-3.5">
        <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
        <Text className="font-body text-muted text-[11px] mx-3 uppercase tracking-wider">
          {t.login.orContinueWith}
        </Text>
        <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          className="flex-1 flex-row items-center justify-center gap-2.5 border border-[#E2E8F0] bg-white rounded-2xl py-3 shadow-sm active:opacity-75"
        >
          {googleLoading ? (
            <ActivityIndicator color="#16262B" size="small" />
          ) : (
            <>
              <GoogleIcon size={18} />
              <Text className="font-body-medium text-ink text-xs font-semibold">
                {t.login.googleButton}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={onGitHubSignIn}
          disabled={githubLoading}
          className="flex-1 flex-row items-center justify-center gap-2.5 border border-[#E2E8F0] bg-white rounded-2xl py-3 shadow-sm active:opacity-75"
        >
          {githubLoading ? (
            <ActivityIndicator color="#16262B" size="small" />
          ) : (
            <>
              <Ionicons name="logo-github" size={18} color="#16262B" />
              <Text className="font-body-medium text-ink text-xs font-semibold">
                {t.login.githubButton}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </Svg>
  );
}