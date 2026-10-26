// Settings screen — account email, rename/unpair kits, change password,
// language selection (English, Hindi, Telugu), and sign out.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { fetchMyKits, type Kit } from "../lib/kits";
import { getCurrentUserEmail, renameKit, unpairKit, changePassword } from "../lib/settings";
import { useAppLanguage, type SupportedLang } from "../lib/LanguageContext";

export default function SettingsScreen() {
  const { lang, setLang, t } = useAppLanguage();
  const [email, setEmail] = useState<string | null>(null);
  const [kits, setKits] = useState<Kit[]>([]);
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKitId, setSavingKitId] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [userEmail, myKits] = await Promise.all([
          getCurrentUserEmail(),
          fetchMyKits(),
        ]);

        setEmail(userEmail);
        setKits(myKits);

        const drafts: Record<string, string> = {};
        myKits.forEach((k) => {
          drafts[k.id] = k.kit_name ?? "";
        });
        setNameDrafts(drafts);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSaveName(kitId: string) {
    setSavingKitId(kitId);
    try {
      await renameKit(kitId, nameDrafts[kitId]?.trim() || "");
      setKits((current) =>
        current.map((k) => (k.id === kitId ? { ...k, kit_name: nameDrafts[kitId]?.trim() || null } : k))
      );
    } catch (err) {
      Alert.alert(
        lang === "hi"
          ? "नाम सहेजा नहीं जा सका"
          : lang === "te"
          ? "పేరును సేవ్ చేయడం సాధ్యపడలేదు"
          : "Couldn't save name",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSavingKitId(null);
    }
  }

  function handleUnpair(kit: Kit) {
    const displayName = kit.kit_name || kit.device_id;
    Alert.alert(
      t.settings.unpairTitle,
      t.settings.unpairMsg(displayName),
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.settings.unpair,
          style: "destructive",
          onPress: async () => {
            try {
              await unpairKit(kit.id);
              setKits((current) => current.filter((k) => k.id !== kit.id));
            } catch (err) {
              Alert.alert(
                lang === "hi"
                  ? "अनपेयर नहीं किया जा सका"
                  : lang === "te"
                  ? "అన్‌పెయిర్ చేయడం సాధ్యపడలేదు"
                  : "Couldn't unpair",
                err instanceof Error ? err.message : "Try again."
              );
            }
          },
        },
      ]
    );
  }

  async function handleChangePassword() {
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage(t.settings.minCharsError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t.settings.mismatchError);
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(newPassword);
      setPasswordMessage(
        lang === "hi"
          ? "पासवर्ड अपडेट हो गया।"
          : lang === "te"
          ? "పాస్‌వర్డ్ విజయవంతంగా అప్‌డేట్ అయింది."
          : "Password updated."
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage(
        err instanceof Error
          ? err.message
          : lang === "hi"
          ? "पासवर्ड अपडेट नहीं किया जा सका।"
          : lang === "te"
          ? "పాస్‌వర్డ్ అప్‌డేట్ చేయడం సాధ్యపడలేదు."
          : "Couldn't update password."
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const topInset = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 48;

  if (loading) {
    return (
      <View className="flex-1 bg-[#102422] items-center justify-center">
        <ActivityIndicator color="#E8A33D" size="large" />
      </View>
    );
  }

  const isSuccessMessage =
    passwordMessage === "Password updated." ||
    passwordMessage === "पासवर्ड अपडेट हो गया।" ||
    passwordMessage === "పాస్‌వర్డ్ విజయవంతంగా అప్‌డేట్ అయింది.";

  return (
    <View className="flex-1 bg-[#102422]">
      <StatusBar barStyle="light-content" />

      {/* Forest Green Header */}
      <View style={{ paddingTop: topInset }} className="px-5 pb-5 flex-row items-center justify-between">
        {router.canGoBack() ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-75"
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
        <Text className="font-display text-lg font-bold text-white">{t.settings.title}</Text>
        <View className="w-10" />
      </View>

      {/* Surface Card Container */}
      <View className="flex-1 bg-[#F9FBFB] rounded-t-[28px] px-5 pt-6 shadow-2xl">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Language Selector */}
          <Text className="font-body-medium text-muted text-[11px] uppercase tracking-wider mb-2 font-semibold px-1">
            {t.settings.language}
          </Text>
          <View className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 flex-row gap-1.5 mb-6 shadow-sm">
            {[
              { code: "en" as SupportedLang, label: "English" },
              { code: "hi" as SupportedLang, label: "हिन्दी" },
              { code: "te" as SupportedLang, label: "తెలుగు" },
            ].map((item) => {
              const active = lang === item.code;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => setLang(item.code)}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center active:opacity-80 ${
                    active ? "bg-[#102422]" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`font-body-medium text-xs font-bold ${
                      active ? "text-[#E8A33D]" : "text-[#5B6E70]"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Account Profile Group */}
          <Text className="font-body-medium text-muted text-[11px] uppercase tracking-wider mb-2 font-semibold px-1">
            {t.settings.account}
          </Text>
          <View className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex-row items-center gap-3.5 mb-6 shadow-sm">
            <View className="w-12 h-12 rounded-2xl bg-[#19433F]/10 border border-[#10B981]/20 items-center justify-center">
              <Ionicons name="person" size={22} color="#2E6F6E" />
            </View>
            <View className="flex-1">
              <Text className="font-body-medium text-ink text-sm font-semibold">{email ?? "Unknown"}</Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <View className="w-2 h-2 rounded-full bg-[#10B981]" />
                <Text className="font-body text-muted text-[11px]">{t.settings.activeSession}</Text>
              </View>
            </View>
          </View>

          {/* Paired Trackers Inset List */}
          <Text className="font-body-medium text-muted text-[11px] uppercase tracking-wider mb-2 font-semibold px-1">
            {t.settings.yourDevices}
          </Text>
          <View className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden mb-6 shadow-sm">
            {kits.length === 0 ? (
              <Text className="p-4 font-body text-muted text-xs">{t.settings.noDevices}</Text>
            ) : (
              kits.map((kit, index) => (
                <View
                  key={kit.id}
                  className={`p-4 flex-row items-center justify-between ${
                    index !== kits.length - 1 ? "border-b border-[#F1F5F9]" : ""
                  }`}
                >
                  <View className="w-10 h-10 rounded-xl bg-[#EBEFEF] items-center justify-center mr-3">
                    <Ionicons name="radio-outline" size={20} color="#2E6F6E" />
                  </View>

                  <View className="flex-1 mr-3">
                    <TextInput
                      value={nameDrafts[kit.id] ?? ""}
                      onChangeText={(text) => setNameDrafts((d) => ({ ...d, [kit.id]: text }))}
                      placeholder={t.settings.namePlaceholder}
                      placeholderTextColor="#9AA6A7"
                      className="font-body-medium text-ink text-sm font-semibold p-0 mb-1"
                    />
                    <Text className="font-body text-muted text-[10px]">{kit.device_id}</Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() => handleSaveName(kit.id)}
                      disabled={savingKitId === kit.id}
                      className="w-9 h-9 rounded-full bg-[#2E6F6E]/10 items-center justify-center active:opacity-75"
                    >
                      {savingKitId === kit.id ? (
                        <ActivityIndicator color="#2E6F6E" size="small" />
                      ) : (
                        <Ionicons name="checkmark" size={18} color="#2E6F6E" />
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleUnpair(kit)}
                      className="w-9 h-9 rounded-full bg-[#EF4444]/10 items-center justify-center active:opacity-75"
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Security Accordion */}
          <Text className="font-body-medium text-muted text-[11px] uppercase tracking-wider mb-2 font-semibold px-1">
            {t.settings.changePassword}
          </Text>
          <View className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden mb-2 shadow-sm">
            <Pressable
              onPress={() => setIsSecurityOpen((v) => !v)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-[#EBEFEF] items-center justify-center">
                  <Ionicons name="lock-closed-outline" size={18} color="#16262B" />
                </View>
                <Text className="font-body-medium text-ink text-xs font-semibold">{t.settings.updateCredentials}</Text>
              </View>
              <Ionicons name={isSecurityOpen ? "chevron-up" : "chevron-down"} size={16} color="#5B6E70" />
            </Pressable>

            {isSecurityOpen && (
              <View className="p-4 pt-1 border-t border-gray-100">
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t.settings.newPasswordPlaceholder}
                  placeholderTextColor="#9AA6A7"
                  secureTextEntry
                  autoComplete="password-new"
                  className="bg-[#F9FBFB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs mb-2 text-ink"
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t.settings.confirmPasswordPlaceholder}
                  placeholderTextColor="#9AA6A7"
                  secureTextEntry
                  autoComplete="password-new"
                  className="bg-[#F9FBFB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs mb-3 text-ink"
                />
                {passwordMessage && (
                  <Text
                    className="font-body text-[11px] mb-2 font-medium"
                    style={{ color: isSuccessMessage ? "#059669" : "#EF4444" }}
                  >
                    {passwordMessage}
                  </Text>
                )}
                <Pressable
                  onPress={handleChangePassword}
                  disabled={passwordSaving}
                  className="bg-[#102422] py-2.5 rounded-xl items-center active:opacity-80"
                >
                  {passwordSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="font-body-medium text-white text-xs font-semibold">{t.settings.saveNewPassword}</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
          <Text className="font-body text-muted text-[10px] mb-6 px-1">
            {lang === "hi"
              ? "यदि आपने Google से साइन इन किया है, तो यह लॉगिन के लिए एक अतिरिक्त पासवर्ड सेट करता है।"
              : lang === "te"
              ? "మీరు Googleతో సైన్ ఇన్ చేసినట్లయితే, లాగిన్ చేయడానికి ఇది అదనపు పాస్‌వర్డ్‌ను సెట్ చేస్తుంది."
              : "If you signed in with Google, this sets a password as an additional way to log in."}
          </Text>

          {/* Sign Out Action */}
          <Pressable
            onPress={handleSignOut}
            className="bg-[#EF4444]/10 border border-[#EF4444]/20 py-4 rounded-2xl items-center flex-row justify-center gap-2 mb-8 shadow-sm active:opacity-75"
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text className="font-body-medium text-[#EF4444] text-xs font-bold">{t.settings.signOut}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}