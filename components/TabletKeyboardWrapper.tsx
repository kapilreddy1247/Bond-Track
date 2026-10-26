import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  ViewStyle,
} from "react-native";

interface TabletKeyboardWrapperProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  cardStyle?: string;
  maxWidth?: number;
}

export default function TabletKeyboardWrapper({
  children,
  leftPanel,
  maxWidth = 420,
}: TabletKeyboardWrapperProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F9FBFB]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View className="flex-1 flex-row">
        {/* Left Branding / Context Panel */}
        {leftPanel && (
          <View style={{ width: "42%" }}>
            {leftPanel}
          </View>
        )}

        {/* Right Interactive Form Area */}
        <View className="flex-1 bg-[#F9FBFB]">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
              paddingVertical: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{ width: "100%", maxWidth }}
              className="bg-white p-8 rounded-[28px] border border-[#E2E8F0] shadow-sm"
            >
              {children}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}