import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useTranslation } from "react-i18next";

function NativeTabLayout() {
  const { t } = useTranslation();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>{t("navigation.home")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>{t("navigation.explore")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} />
        <Label>{t("navigation.library")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>{t("navigation.profile")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { t } = useTranslation();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#0D0D0D",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0D0D0D" }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("navigation.home"),
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "house.fill" : "house"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "home" : "home-outline"} size={23} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("navigation.explore"),
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name="magnifyingglass" tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "search" : "search-outline"} size={23} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t("navigation.library"),
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "books.vertical.fill" : "books.vertical"}
                tintColor={color}
                size={24}
              />
            ) : (
              <Ionicons name={focused ? "library" : "library-outline"} size={23} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("navigation.profile"),
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.fill" : "person"} tintColor={color} size={24} />
            ) : (
              <Ionicons name={focused ? "person" : "person-outline"} size={23} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
