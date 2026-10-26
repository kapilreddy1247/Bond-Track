import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppLanguage, SupportedLang } from "../lib/LanguageContext";

const LANGUAGES: { code: SupportedLang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "te", label: "TE" },
];

export default function AuthLanguagePill() {
  const { lang, setLang } = useAppLanguage();

  return (
    <View className="flex-row items-center bg-white/10 rounded-full p-0.5 border border-white/15">
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
}