import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resources } from "./translations";

const LANGUAGE_KEY = "user_language_preference";

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (!savedLanguage) {
    // Detect device locale or fall back to English
    const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "en";
    savedLanguage = ["en", "hi", "te"].includes(deviceLocale) ? deviceLocale : "en";
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export async function changeAppLanguage(lang: "en" | "hi" | "te") {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;