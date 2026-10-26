// Small shared pieces for the Home dashboard: the status dot and the
// large icon+label action buttons.

import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function StatusDot({ color }: { color: string }) {
  return (
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
  );
}

export function ActionButton({
  icon,
  label,
  onPress,
  variant = "brand",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: "brand" | "accent" | "danger";
}) {
  const bgClass = variant === "accent" ? "bg-accent" : variant === "danger" ? "bg-danger" : "bg-brand";
  const iconColor = variant === "accent" ? "#16262B" : "#FFFFFF";
  const textClass = variant === "accent" ? "text-ink" : "text-white";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 ${bgClass} rounded-2xl py-4 items-center active:opacity-80`}
    >
      <Ionicons name={icon} size={20} color={iconColor} style={{ marginBottom: 4 }} />
      <Text className={`font-body-medium text-xs ${textClass}`}>{label}</Text>
    </Pressable>
  );
}