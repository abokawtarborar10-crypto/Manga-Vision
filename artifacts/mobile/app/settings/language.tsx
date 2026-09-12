import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useI18n } from "@/context/I18nContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "react-i18next";
import { DirectionalIcon } from "@/components/DirectionalIcon";

export default function LanguageSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { appLanguage, setAppLanguage } = useSettings();
  const { direction } = useI18n();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        >
          <DirectionalIcon name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("settings.language")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.label,
            { color: colors.mutedForeground, writingDirection: direction, textAlign: direction === "rtl" ? "right" : "left" },
          ]}
        >
          {t("settings.chooseLanguage")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {LANGUAGE_OPTIONS.map((option, index) => {
            const selected = option.code === appLanguage;
            return (
              <Pressable
                key={option.code}
                onPress={() => setAppLanguage(option.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.nativeName}
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: index === LANGUAGE_OPTIONS.length - 1 ? 0 : StyleSheet.hairlineWidth,
                    backgroundColor: pressed ? `${colors.primary}0A` : "transparent",
                  },
                ]}
              >
                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.nativeName,
                      { color: colors.foreground, writingDirection: direction, textAlign: direction === "rtl" ? "right" : "left" },
                    ]}
                  >
                    {option.nativeName}
                  </Text>
                  <Text
                    style={[
                      styles.englishName,
                      { color: colors.mutedForeground, writingDirection: "ltr", textAlign: direction === "rtl" ? "right" : "left" },
                    ]}
                  >
                    {option.englishName}
                  </Text>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Text
          style={[
            styles.note,
            { color: colors.mutedForeground, writingDirection: direction, textAlign: direction === "rtl" ? "right" : "left" },
          ]}
        >
          {t("settings.languageDescription")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "600" as const },
  headerSpacer: { width: 38 },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  card: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  option: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { gap: 3 },
  nativeName: { fontSize: 16, fontWeight: "600" as const },
  englishName: { fontSize: 12 },
  note: { fontSize: 12, lineHeight: 17, marginTop: 12, paddingHorizontal: 4 },
});