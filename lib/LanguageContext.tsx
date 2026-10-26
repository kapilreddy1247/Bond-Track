import React, { createContext, useContext, useState } from "react";
import * as Localization from "expo-localization";

export type SupportedLang = "en" | "hi" | "te";

export const APP_TRANSLATIONS = {
  en: {
    back: "Back",
    cancel: "Cancel",
    save: "Save",
    active: "Active",

    login: {
      tagline: "Stay connected to what matters, without needing to check.",
      welcomeBack: "Welcome back",
      subtitle: "Log in to monitor and track your Bond-Track kits.",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      signInButton: "Sign In",
      orContinueWith: "Or continue with",
      googleButton: "Google",
      githubButton: "GitHub",
      noAccount: "Don't have an account?",
      createAccountLink: "Create account",
      fillAllFields: "Please enter both email and password.",
    },

    home: {
      noDevicesTitle: "No devices paired yet",
      noDevicesSub: "Pair your Parent Device to start keeping an eye on things here.",
      pairDevice: "Pair a device",
      noLocation: "No location received yet from this device.",
      addDevice: "Add Device",
      lastSeen: "Last seen",
      trackLive: "Track live",
      stopTracking: "Stop tracking",
      getDirections: "Get directions",
      details: "Details",
      accuracy: "Accuracy",
      source: "Source",
      deviceId: "Device ID",
    },

    signup: {
      createAccount: "Create Account",
      subtitle: "Set up guardian credentials to pair and track your Bond-Track kits.",
      googleSignup: "Sign up with Google",
      orEmail: "Or with email",
      fullName: "Full name",
      fullNamePlaceholder: "Jane Doe",
      email: "Email address",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Re-enter your password",
      submitButton: "Create Account",
      alreadyAccount: "Already have an account?",
      loginLink: "Log In",
      checkEmailTitle: "Check your email",
      checkEmailSub: (emailStr: string) =>
        `We sent a confirmation link to ${emailStr}. Confirm your email, then log in to get started.`,
      backToLogin: "Back to log in",
      fillAllFields: "Fill in every field to continue.",
      minCharsError: "Password must be at least 8 characters.",
      mismatchError: "Passwords don't match.",
    },

    settings: {
      title: "Settings",
      language: "LANGUAGE",
      account: "ACCOUNT",
      activeSession: "Active Session",
      yourDevices: "YOUR DEVICES",
      noDevices: "No devices paired yet.",
      namePlaceholder: "Name this device",
      unpairTitle: "Unpair this device?",
      unpairMsg: (name: string) => `You'll stop seeing updates from ${name} until you pair it again.`,
      unpair: "Unpair",
      changePassword: "CHANGE PASSWORD",
      updateCredentials: "Update Credentials",
      newPasswordPlaceholder: "New password (min 8 chars)",
      confirmPasswordPlaceholder: "Confirm new password",
      saveNewPassword: "Save New Password",
      minCharsError: "Password must be at least 8 characters.",
      mismatchError: "Passwords don't match.",
      signOut: "Sign out",
    },
  },

  hi: {
    back: "वापस",
    cancel: "रद्द करें",
    save: "सहेजें",
    active: "सक्रिय",

    login: {
      tagline: "जो महत्वपूर्ण है उससे जुड़े रहें, बार-बार जांचने की आवश्यकता के बिना।",
      welcomeBack: "वापसी पर स्वागत है",
      subtitle: "अपने बॉन्ड-ट्रैक किट की निगरानी और ट्रैक करने के लिए लॉग इन करें।",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "aapka@example.com",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      forgotPassword: "पासवर्ड भूल गए?",
      signInButton: "साइन इन करें",
      orContinueWith: "या इसके साथ जारी रखें",
      googleButton: "Google",
      githubButton: "GitHub",
      noAccount: "खाता नहीं है?",
      createAccountLink: "खाता बनाएं",
      fillAllFields: "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।",
    },

    home: {
      noDevicesTitle: "अभी तक कोई उपकरण नहीं जोड़ा गया",
      noDevicesSub: "निगरानी शुरू करने के लिए अपने पैरेंट डिवाइस को जोड़ें।",
      pairDevice: "उपकरण जोड़ें",
      noLocation: "इस उपकरण से अभी तक कोई स्थान प्राप्त नहीं हुआ।",
      addDevice: "उपकरण जोड़ें",
      lastSeen: "अंतिम बार देखा गया",
      trackLive: "लाइव ट्रैक करें",
      stopTracking: "ट्रैकिंग रोकें",
      getDirections: "दिशा-निर्देश प्राप्त करें",
      details: "विवरण",
      accuracy: "सटीकता",
      source: "स्रोत",
      deviceId: "उपकरण आईडी",
    },

    signup: {
      createAccount: "खाता बनाएं",
      subtitle: "अपने बॉन्ड-ट्रैक किट को पेयर और ट्रैक करने के लिए गार्जियन खाता सेट करें।",
      googleSignup: "Google से साइन अप करें",
      orEmail: "या ईमेल से",
      fullName: "पूरा नाम",
      fullNamePlaceholder: "आपका नाम",
      email: "ईमेल पता",
      emailPlaceholder: "aapka@example.com",
      password: "पासवर्ड",
      passwordPlaceholder: "कम से कम 8 अक्षर",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      confirmPasswordPlaceholder: "पासवर्ड पुनः दर्ज करें",
      submitButton: "खाता बनाएं",
      alreadyAccount: "क्या आपके पास पहले से एक खाता मौजूद है?",
      loginLink: "लॉग इन करें",
      checkEmailTitle: "अपना ईमेल जांचें",
      checkEmailSub: (emailStr: string) =>
        `हमने ${emailStr} पर एक पुष्टिकरण लिंक भेजा है। कृपया शुरू करने के लिए अपना ईमेल सत्यापित करें।`,
      backToLogin: "लॉग इन पर वापस जाएं",
      fillAllFields: "जारी रखने के लिए सभी फ़ील्ड भरें।",
      minCharsError: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
      mismatchError: "पासवर्ड मेल नहीं खाते।",
    },

    settings: {
      title: "सेटिंग्स",
      language: "भाषा (LANGUAGE)",
      account: "खाता",
      activeSession: "सक्रिय सत्र",
      yourDevices: "आपके उपकरण",
      noDevices: "अभी तक कोई उपकरण नहीं जोड़ा गया।",
      namePlaceholder: "इस उपकरण का नाम रखें",
      unpairTitle: "क्या इस उपकरण को अनपेयर करें?",
      unpairMsg: (name: string) => `जब तक आप इसे दोबारा पेयर नहीं करते, आपको ${name} से अपडेट नहीं मिलेंगे।`,
      unpair: "अनपेयर करें",
      changePassword: "पासवर्ड बदलें",
      updateCredentials: "क्रेडेंशियल अपडेट करें",
      newPasswordPlaceholder: "नया पासवर्ड (न्यूनतम 8 अक्षर)",
      confirmPasswordPlaceholder: "नए पासवर्ड की पुष्टि करें",
      saveNewPassword: "नया पासवर्ड सहेजें",
      minCharsError: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
      mismatchError: "पासवर्ड मेल नहीं खाते।",
      signOut: "साइन आउट",
    },
  },

  te: {
    back: "వెనుకకు",
    cancel: "రద్దు చేయండి",
    save: "సేవ్ చేయండి",
    active: "యాక్టివ్",

    login: {
      tagline: "ఎప్పటికప్పుడు తనిఖీ చేయాల్సిన అవసరం లేకుండా, ముఖ్యమైన వాటితో అనుసంధానించబడి ఉండండి.",
      welcomeBack: "స్వాగతం",
      subtitle: "మీ బాండ్-ట్రాక్ పరికరాలను పర్యవేక్షించడానికి లాగిన్ అవ్వండి.",
      emailLabel: "ఈమెయిల్ చిరునామా",
      emailPlaceholder: "you@example.com",
      passwordLabel: "పాస్‌వర్డ్",
      passwordPlaceholder: "మీ పాస్‌వర్డ్‌ను నమోదు చేయండి",
      forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
      signInButton: "సైన్ ఇన్ చేయండి",
      orContinueWith: "లేదా దీనితో కొనసాగించండి",
      googleButton: "Google",
      githubButton: "GitHub",
      noAccount: "ఖాతా లేదా?",
      createAccountLink: "ఖాతాను సృష్టించండి",
      fillAllFields: "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ రెండింటినీ నమోదు చేయండి.",
    },

    home: {
      noDevicesTitle: "ఇంకా ఏ పరికరాలూ జతచేయబడలేదు",
      noDevicesSub: "పర్యవేక్షణ ప్రారంభించడానికి మీ పేరెంట్ పరికరాన్ని జతచేయండి.",
      pairDevice: "పరికరాన్ని జతచేయండి",
      noLocation: "ఈ పరికరం నుండి ఇంకా లొకేషన్ వివరాలు రాలేదు.",
      addDevice: "పరికరాన్ని జోడించండి",
      lastSeen: "చివరిగా చూసిన సమయం",
      trackLive: "లైవ్ ట్రాక్ చేయండి",
      stopTracking: "ట్రాకింగ్ ఆపండి",
      getDirections: "దిశలను పొందండి",
      details: "వివరాలు",
      accuracy: "ఖచ్చితత్వం",
      source: "మూలం",
      deviceId: "పరికర ఐడీ",
    },

    signup: {
      createAccount: "ఖాతాను సృష్టించండి",
      subtitle: "బాండ్-ట్రాక్ పరికరాలను జత చేయడానికి మరియు ట్రాక్ చేయడానికి గార్డియన్ ఖాతాను సెటప్ చేయండి.",
      googleSignup: "Googleతో సైన్ అప్ చేయండి",
      orEmail: "లేదా ఈమెయిల్ ద్వారా",
      fullName: "పూర్తి పేరు",
      fullNamePlaceholder: "మీ పేరు",
      email: "ఈమెయిల్ చిరునామా",
      emailPlaceholder: "you@example.com",
      password: "పాస్‌వర్డ్",
      passwordPlaceholder: "కనీసం 8 అక్షరాలు",
      confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
      confirmPasswordPlaceholder: "పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి",
      submitButton: "ఖాతాను సృష్టించండి",
      alreadyAccount: "ఇప్పటికే ఖాతా ఉందా?",
      loginLink: "లాగిన్ అవ్వండి",
      checkEmailTitle: "మీ ఈమెయిల్ తనిఖీ చేయండి",
      checkEmailSub: (emailStr: string) =>
        `మేము ${emailStr} కు నిర్ధారణ లింక్‌ను పంపాము. ప్రారంభించడానికి ధృవీకరించండి.`,
      backToLogin: "లాగిన్‌కు తిరిగి వెళ్లండి",
      fillAllFields: "కొనసాగడానికి ప్రతి ఫీల్డ్‌ను పూరించండి.",
      minCharsError: "పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి.",
      mismatchError: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు.",
    },

    settings: {
      title: "సెట్టింగ్‌లు",
      language: "భాష (LANGUAGE)",
      account: "ఖాతా",
      activeSession: "యాక్టివ్ సెషన్",
      yourDevices: "మీ పరికరాలు",
      noDevices: "ఇంకా ఏ పరికరాలూ జతచేయబడలేదు.",
      namePlaceholder: "ఈ పరికరానికి పేరు పెట్టండి",
      unpairTitle: "ఈ పరికరాన్ని తీసివేయాలా (అన్‌పెయిర్)?",
      unpairMsg: (name: string) => `మీరు దీన్ని మళ్లీ జతచేసే వరకు ${name} నుండి అప్‌డేట్‌లు కనిపించవు.`,
      unpair: "అన్‌పెయిర్ చేయండి",
      changePassword: "పాస్‌వర్డ్ మార్చండి",
      updateCredentials: "వివరాలను అప్‌డేట్ చేయండి",
      newPasswordPlaceholder: "కొత్త పాస్‌వర్డ్ (కనీసం 8 అక్షరాలు)",
      confirmPasswordPlaceholder: "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి",
      saveNewPassword: "కొత్త పాస్‌వర్డ్‌ను సేవ్ చేయండి",
      minCharsError: "పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి.",
      mismatchError: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు.",
      signOut: "సైన్ అవుట్",
    },
  },
};

interface LanguageContextType {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: typeof APP_TRANSLATIONS["en"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: APP_TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "en";
  const initialLang: SupportedLang = ["en", "hi", "te"].includes(deviceLocale)
    ? (deviceLocale as SupportedLang)
    : "en";

  const [lang, setLang] = useState<SupportedLang>(initialLang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: APP_TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useAppLanguage = () => useContext(LanguageContext);