import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type CategoryIconSize = "compact" | "feature";

const ICON_SIZES: Record<CategoryIconSize, number> = {
  compact: 16,
  feature: 20,
};

export function CategoryIcon({
  name,
  size = "compact",
  active = false,
}: {
  name: string;
  size?: CategoryIconSize;
  active?: boolean;
}) {
  const colors = useColors();
  const iconSize = ICON_SIZES[size];

  return (
    <View
      style={[
        styles.wrap,
        size === "feature" ? styles.featureWrap : styles.compactWrap,
        { backgroundColor: active ? `${colors.primary}20` : "transparent" },
      ]}
    >
      <Ionicons
        name={name as never}
        size={iconSize}
        color={active ? colors.primary : colors.mutedForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  compactWrap: {
    width: 20,
    height: 20,
  },
  featureWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
});