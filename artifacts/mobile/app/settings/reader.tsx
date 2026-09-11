import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/context/SettingsContext";
import {
  SettingsSection,
  SettingsItem,
  SettingsToggle,
  SettingsOptionSelector,
} from "@/components/settings";
import { SettingsSlider } from "@/components/settings/SettingsSlider";
import { useTranslation } from "react-i18next";

const READING_MODE_OPTS = [
  { value: "vertical",   label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
];

const DIRECTION_OPTS = [
  { value: "ltr", label: "LTR" },
  { value: "rtl", label: "RTL" },
];

const TRANSITION_OPTS = [
  { value: "scroll", label: "Scroll" },
  { value: "swipe",  label: "Swipe" },
];

const FIT_OPTS = [
  { value: "width",  label: "Width" },
  { value: "height", label: "Height" },
  { value: "screen", label: "Screen" },
];

export default function ReaderSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { readerSettings, updateReaderSettings } = useSettings();
  const { t } = useTranslation();
  const readingModeOptions = [
    { value: "vertical", label: t("reader.verticalScroll") },
    { value: "horizontal", label: t("reader.pageByPage") },
  ];
  const directionOptions = [
    { value: "ltr", label: t("reader.leftToRight") },
    { value: "rtl", label: t("reader.rightToLeft") },
  ];
  const transitionOptions = [
    { value: "scroll", label: t("reader.continuous") },
    { value: "swipe", label: t("reader.swipe") },
  ];
  const fitOptions = [
    { value: "width", label: t("reader.fitWidth") },
    { value: "height", label: t("reader.fitHeight") },
    { value: "screen", label: t("reader.fitScreen") },
  ];

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = 40 + (Platform.OS === "web" ? 34 : insets.bottom);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("navigation.reader")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 12, paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Reading ───────────────────────────────────────────────────── */}
        <SettingsSection title={t("reader.reading")} icon="book-outline" defaultExpanded>
          <SettingsItem
            icon="phone-portrait-outline"
            label={t("reader.readingMode")}
            description={readerSettings.readingMode === "vertical" ? t("reader.verticalScroll") : t("reader.pageByPage")}
            noChevron
            right={
              <SettingsOptionSelector
                options={readingModeOptions}
                selected={readerSettings.readingMode}
                onChange={(v) => updateReaderSettings({ readingMode: v as never })}
                layout="row"
              />
            }
          />
          <SettingsItem
            icon="swap-vertical-outline"
            label={t("reader.scrolling")}
            description={
              readerSettings.scrollingEnabled
                ? t("reader.enabled")
                : t("reader.disabled")
            }
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.scrollingEnabled}
                onValueChange={(v) =>
                  updateReaderSettings({ scrollingEnabled: v })
                }
              />
            }
          />
          <SettingsItem
            icon="arrow-forward-outline"
            label={t("reader.readingDirection")}
            description={readerSettings.readingDirection === "ltr" ? t("reader.leftToRight") : t("reader.rightToLeft")}
            noChevron
            right={
              <SettingsOptionSelector
                options={directionOptions}
                selected={readerSettings.readingDirection}
                onChange={(v) => updateReaderSettings({ readingDirection: v as never })}
                layout="row"
              />
            }
          />
          <SettingsItem
            icon="swap-horizontal-outline"
            label={t("reader.pageTransition")}
            description={
              readerSettings.readingMode === "vertical"
                ? t("reader.continuous")
                : readerSettings.pageTransition === "scroll"
                  ? t("reader.continuous")
                  : t("reader.swipe")
            }
            noChevron
            right={
              <SettingsOptionSelector
                options={transitionOptions}
                selected={readerSettings.pageTransition}
                onChange={(v) => updateReaderSettings({ pageTransition: v as never })}
                layout="row"
              />
            }
          />
          <SettingsItem
            icon="sparkles-outline"
            label={t("reader.pageAnimation")}
            description={t("reader.animateTransitions")}
            last
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.pageAnimation}
                onValueChange={(v) => updateReaderSettings({ pageAnimation: v })}
              />
            }
          />
        </SettingsSection>

        <View style={{ height: 6 }} />

        {/* ── Display ───────────────────────────────────────────────────── */}
        <SettingsSection title={t("reader.display")} icon="desktop-outline" defaultExpanded>
          <SettingsItem
            icon="sunny-outline"
            label={t("reader.keepAwake")}
            description={t("reader.keepAwakeDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.keepScreenAwake}
                onValueChange={(v) => updateReaderSettings({ keepScreenAwake: v })}
              />
            }
          />
          <SettingsItem
            icon="expand-outline"
            label={t("reader.hideSystemBars")}
            description={t("reader.immersiveDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.hideSystemBars}
                onValueChange={(v) => updateReaderSettings({ hideSystemBars: v })}
              />
            }
          />
          <SettingsItem
            icon="layers-outline"
            label={t("reader.showPageNumber")}
            description={t("reader.pageNumberDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.showPageNumber}
                onValueChange={(v) => updateReaderSettings({ showPageNumber: v })}
              />
            }
          />
          <SettingsItem
            icon="bar-chart-outline"
            label={t("reader.progressBar")}
            description={t("reader.progressBarDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.showProgressBar}
                onValueChange={(v) => updateReaderSettings({ showProgressBar: v })}
              />
            }
          />

          {/* Brightness */}
          <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
            <SettingsSlider
              label={t("reader.brightness")}
              value={readerSettings.brightness === -1 ? 0 : Math.round(readerSettings.brightness * 100)}
              min={0}
              max={100}
              step={5}
              onChange={(v) => updateReaderSettings({ brightness: v === 0 && readerSettings.brightness === -1 ? -1 : v / 100 })}
              formatValue={(v) => v === 0 ? "Auto" : `${v}%`}
              presets={[
                { label: "Auto", value: 0 },
                { label: "50%", value: 50 },
                { label: "80%", value: 80 },
                { label: "100%", value: 100 },
              ]}
            />
          </View>
        </SettingsSection>

        <View style={{ height: 6 }} />

        {/* ── Interaction ───────────────────────────────────────────────── */}
        <SettingsSection title={t("reader.interaction")} icon="hand-left-outline" defaultExpanded>
          <SettingsItem
            icon="scan-outline"
            label={t("reader.doubleTapZoom")}
            description={t("reader.doubleTapDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.doubleTapZoom}
                onValueChange={(v) => updateReaderSettings({ doubleTapZoom: v })}
              />
            }
          />
          <SettingsItem
            icon="resize-outline"
            label={t("reader.pinchZoom")}
            description={t("reader.pinchDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.pinchZoom}
                onValueChange={(v) => updateReaderSettings({ pinchZoom: v })}
              />
            }
          />
          <SettingsItem
            icon="contract-outline"
            label={t("reader.fitMode")}
            description={readerSettings.fitMode === "width" ? t("reader.fitWidth") : readerSettings.fitMode === "height" ? t("reader.fitHeight") : t("reader.fitScreen")}
            noChevron
            last
            right={
              <SettingsOptionSelector
                options={fitOptions}
                selected={readerSettings.fitMode}
                onChange={(v) => updateReaderSettings({ fitMode: v as never })}
                layout="row"
              />
            }
          />
        </SettingsSection>

        <View style={{ height: 6 }} />

        {/* ── Pages ─────────────────────────────────────────────────────── */}
        <SettingsSection title={t("reader.pagesSection")} icon="images-outline" defaultExpanded>
          <SettingsItem
            icon="leaf-outline"
            label={t("reader.dataSaver")}
            description={t("reader.dataSaverDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.dataSaver}
                onValueChange={(v) => updateReaderSettings({ dataSaver: v })}
              />
            }
          />
          <SettingsItem
            icon="bookmark-outline"
            label={t("reader.rememberLastPage")}
            description={t("reader.rememberDescription")}
            noChevron
            right={
              <SettingsToggle
                value={readerSettings.rememberLastPage}
                onValueChange={(v) => updateReaderSettings({ rememberLastPage: v })}
              />
            }
          />
          <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
            <SettingsSlider
              label={t("reader.preloadPages")}
              value={readerSettings.preloadPages}
              min={1}
              max={5}
              onChange={(v) => updateReaderSettings({ preloadPages: v })}
              formatValue={(v) => `${v} page${v !== 1 ? "s" : ""}`}
              presets={[
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "5", value: 5 },
              ]}
            />
          </View>
        </SettingsSection>
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
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "600" as const },
});
