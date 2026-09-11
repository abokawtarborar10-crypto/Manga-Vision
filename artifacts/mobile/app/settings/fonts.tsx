import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSettings, DEFAULT_FONT_SETTINGS } from "@/context/SettingsContext";
import {
  SettingsSection,
  SettingsItem,
  SettingsToggle,
  SettingsOptionSelector,
} from "@/components/settings";
import { SettingsSlider } from "@/components/settings/SettingsSlider";
import { useTranslation } from "react-i18next";

const FONT_FAMILY_OPTS = [
  { value: "system",    label: "System" },
  { value: "inter",     label: "Inter" },
  { value: "monospace", label: "Mono" },
];

const PREVIEW_DIRECTION_OPTS = [
  { value: "ltr", label: "LTR" },
  { value: "rtl", label: "RTL" },
];

const FONT_WEIGHT_OPTS = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

const TEXT_ALIGN_OPTS = [
  { value: "left",   label: "Left" },
  { value: "center", label: "Center" },
  { value: "right",  label: "Right" },
];

const QUALITY_OPTS = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
];

const COLOR_PRESETS = [
  "#FFFFFF", "#F5F5F5", "#FFFDE7",
  "#1A1A1A", "#000000", "#FF1744",
  "#2196F3", "#4CAF50", "#FF9800",
];

function ColorSwatch({
  color,
  selected,
  onPress,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.swatch,
        { backgroundColor: color, borderWidth: selected ? 2 : 1, borderColor: selected ? "#FF1744" : "rgba(255,255,255,0.2)" },
      ]}
    >
      {selected && <Ionicons name="checkmark" size={12} color={color === "#FFFFFF" || color === "#F5F5F5" || color === "#FFFDE7" ? "#000" : "#fff"} />}
    </Pressable>
  );
}

export default function FontsScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    fontSettings,
    updateFontSettings,
    resetFontSettings,
    setCustomFont,
    clearCustomFont,
  } = useSettings();
  const [previewDirection, setPreviewDirection] = useState<"ltr" | "rtl">("ltr");
  const [importingFont, setImportingFont] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = 40 + (Platform.OS === "web" ? 34 : insets.bottom);

  const fontFamilyOptions = useMemo(() => {
    if (!fontSettings.customFontFamily) return FONT_FAMILY_OPTS;
    return [
      ...FONT_FAMILY_OPTS,
      { value: "custom", label: fontSettings.customFontFamily.slice(0, 12) },
    ];
  }, [fontSettings.customFontFamily]);

  const resolveFontFamily = () => {
    if (fontSettings.fontFamily === "inter") return "Inter_400Regular";
    if (fontSettings.fontFamily === "monospace") return "monospace" as const;
    if (fontSettings.fontFamily === "custom") return fontSettings.customFontFamily || undefined;
    return undefined;
  };

  const handleImportFont = async () => {
    setImportingFont(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const extension = asset.name.split(".").pop()?.toLowerCase();
      if (!extension || !["ttf", "otf", "woff", "woff2"].includes(extension)) {
        Alert.alert("Unsupported font", "Choose a .ttf, .otf, .woff, or .woff2 font file.");
        return;
      }

      const baseName = asset.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .replace(/^(\d)/, "_$1");
      const familyName = `MangaVerse_${baseName || "CustomFont"}`;
      await setCustomFont({ familyName, uri: asset.uri });
      Alert.alert("Font imported", `${asset.name} is now available in the reader.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The font could not be loaded.";
      Alert.alert("Font import failed", message);
    } finally {
      setImportingFont(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Fonts",
      "Restore all font and text settings to defaults?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetFontSettings },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("settings.fonts")}</Text>
        <Pressable onPress={handleReset} style={styles.resetBtn}>
          <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 12, paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Live preview ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LIVE PREVIEW</Text>
          <View style={[styles.previewCard, { backgroundColor: "#1a1a2e", borderColor: colors.border, borderRadius: colors.radius }]}>
            {/* Manga panel background */}
            <View style={styles.previewPanel}>
              <View
                style={[
                  styles.speechBubble,
                  {
                    backgroundColor: `${fontSettings.bgColor}${Math.round(fontSettings.bgOpacity * 2.55).toString(16).padStart(2, "0")}`,
                    borderRadius: fontSettings.bubbleBorderRadius,
                    padding: fontSettings.bubblePadding,
                    shadowColor: fontSettings.shadow ? "#000" : "transparent",
                    shadowOpacity: fontSettings.shadow ? 0.5 : 0,
                    shadowRadius: 4,
                    elevation: fontSettings.shadow ? 4 : 0,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: resolveFontFamily(),
                    fontSize: fontSettings.fontSize,
                    fontWeight: fontSettings.fontWeight as never,
                    lineHeight: fontSettings.fontSize * fontSettings.lineSpacing,
                    letterSpacing: fontSettings.letterSpacing,
                    textAlign: fontSettings.textAlign as never,
                    color: fontSettings.textColor,
                    textShadowColor: fontSettings.outlineColor,
                    textShadowOffset: { width: fontSettings.outlineThickness * 0.5, height: fontSettings.outlineThickness * 0.5 },
                    textShadowRadius: fontSettings.outlineThickness,
                    writingDirection: previewDirection,
                    ...(Platform.OS === "web" ? { direction: previewDirection } : {}),
                  }}
                >
                  {previewDirection === "rtl"
                    ? "هذه مجرد البداية.\nThis is only the beginning."
                    : "This is only the beginning.\nこれは、ただの始まりに過ぎない。"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.previewDirection}>
            <Text style={[styles.previewDirectionLabel, { color: colors.mutedForeground }]}>
              Preview direction
            </Text>
            <SettingsOptionSelector
              options={PREVIEW_DIRECTION_OPTS}
              selected={previewDirection}
              onChange={(value) => setPreviewDirection(value as "ltr" | "rtl")}
              layout="row"
            />
          </View>
        </View>

        {/* ── Typography ────────────────────────────────────────────────── */}
        <SettingsSection title="Typography" icon="text-outline" defaultExpanded>
          <SettingsItem
            icon="text-outline"
            label="Font Family"
            noChevron
            right={
              <SettingsOptionSelector
                options={fontFamilyOptions}
                selected={fontSettings.fontFamily}
                onChange={(v) => updateFontSettings({ fontFamily: v as never })}
                layout="row"
              />
            }
          />
          <View style={[styles.importRow, { borderTopColor: colors.border }]}>
            <View style={styles.importCopy}>
              <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
              <View style={styles.importText}>
                <Text style={[styles.colorLabel, { color: colors.foreground }]}>
                  Custom font
                </Text>
                <Text style={[styles.importDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {fontSettings.customFontFamily
                    ? `${fontSettings.customFontFamily} imported`
                    : "Import a TTF, OTF, WOFF, or WOFF2 file"}
                </Text>
              </View>
            </View>
            <View style={styles.importActions}>
              {fontSettings.customFontFamily ? (
                <Pressable onPress={clearCustomFont} style={[styles.smallAction, { borderColor: colors.border }]}>
                  <Text style={[styles.smallActionText, { color: colors.mutedForeground }]}>Remove</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={handleImportFont}
                disabled={importingFont}
                style={[styles.importButton, { backgroundColor: colors.primary, opacity: importingFont ? 0.65 : 1 }]}
              >
                {importingFont ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add" size={15} color="#fff" />
                    <Text style={styles.importButtonText}>Import</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
          <SettingsItem
            icon="medal-outline"
            label="Font Weight"
            noChevron
            right={
              <SettingsOptionSelector
                options={FONT_WEIGHT_OPTS}
                selected={fontSettings.fontWeight}
                onChange={(v) => updateFontSettings({ fontWeight: v as never })}
                layout="row"
              />
            }
          />
          <SettingsItem
            icon="reorder-three-outline"
            label="Text Alignment"
            noChevron
            right={
              <SettingsOptionSelector
                options={TEXT_ALIGN_OPTS}
                selected={fontSettings.textAlign}
                onChange={(v) => updateFontSettings({ textAlign: v as never })}
                layout="row"
              />
            }
          />
          <View style={{ paddingHorizontal: 14, paddingVertical: 14, gap: 16 }}>
            <SettingsSlider
              label="Font Size"
              value={fontSettings.fontSize}
              min={12}
              max={24}
              onChange={(v) => updateFontSettings({ fontSize: v })}
              unit="px"
              presets={[
                { label: "12", value: 12 },
                { label: "16", value: 16 },
                { label: "20", value: 20 },
                { label: "24", value: 24 },
              ]}
            />
            <SettingsSlider
              label="Line Spacing"
              value={fontSettings.lineSpacing}
              min={1.0}
              max={2.5}
              step={0.1}
              onChange={(v) => updateFontSettings({ lineSpacing: Math.round(v * 10) / 10 })}
              unit="×"
            />
            <SettingsSlider
              label="Letter Spacing"
              value={fontSettings.letterSpacing}
              min={-1}
              max={3}
              step={0.5}
              onChange={(v) => updateFontSettings({ letterSpacing: Math.round(v * 10) / 10 })}
              unit="px"
            />
          </View>
        </SettingsSection>

        <View style={{ height: 6 }} />

        {/* ── Colors ────────────────────────────────────────────────────── */}
        <SettingsSection title="Colors" icon="color-palette-outline" defaultExpanded>
          <View style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 14 }}>
            {/* Text color */}
            <View>
              <Text style={[styles.colorLabel, { color: colors.foreground }]}>Text Color</Text>
              <View style={styles.swatchRow}>
                {COLOR_PRESETS.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={fontSettings.textColor === c}
                    onPress={() => updateFontSettings({ textColor: c })}
                  />
                ))}
              </View>
            </View>

            {/* Outline */}
            <View style={{ gap: 10 }}>
              <Text style={[styles.colorLabel, { color: colors.foreground }]}>Outline Color</Text>
              <View style={styles.swatchRow}>
                {["#000000", "#1A1A1A", "#FFFFFF", "#FF1744", "#2196F3"].map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={fontSettings.outlineColor === c}
                    onPress={() => updateFontSettings({ outlineColor: c })}
                  />
                ))}
              </View>
              <SettingsSlider
                label="Outline Thickness"
                value={fontSettings.outlineThickness}
                min={0}
                max={4}
                step={0.5}
                onChange={(v) => updateFontSettings({ outlineThickness: Math.round(v * 2) / 2 })}
                unit="px"
                presets={[
                  { label: "None", value: 0 },
                  { label: "1px", value: 1 },
                  { label: "2px", value: 2 },
                ]}
              />
            </View>
          </View>
        </SettingsSection>

        <View style={{ height: 6 }} />

        {/* ── Bubble Style ──────────────────────────────────────────────── */}
        <SettingsSection title="Speech Bubble" icon="chatbubble-outline" defaultExpanded>
          <View style={{ paddingHorizontal: 14, paddingVertical: 14, gap: 16 }}>
            {/* Background color */}
            <View style={{ gap: 8 }}>
              <Text style={[styles.colorLabel, { color: colors.foreground }]}>Background Color</Text>
              <View style={styles.swatchRow}>
                {["#000000", "#1A1A1A", "#FFFFFF", "#FFF9C4", "#E3F2FD"].map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={fontSettings.bgColor === c}
                    onPress={() => updateFontSettings({ bgColor: c })}
                  />
                ))}
              </View>
            </View>
            <SettingsSlider
              label="Background Opacity"
              value={fontSettings.bgOpacity}
              min={0}
              max={100}
              step={5}
              onChange={(v) => updateFontSettings({ bgOpacity: v })}
              unit="%"
              presets={[
                { label: "0%", value: 0 },
                { label: "50%", value: 50 },
                { label: "80%", value: 80 },
                { label: "100%", value: 100 },
              ]}
            />
            <SettingsSlider
              label="Border Radius"
              value={fontSettings.bubbleBorderRadius}
              min={0}
              max={24}
              onChange={(v) => updateFontSettings({ bubbleBorderRadius: v })}
              unit="px"
              presets={[
                { label: "Square", value: 0 },
                { label: "Rounded", value: 12 },
                { label: "Pill", value: 24 },
              ]}
            />
            <SettingsSlider
              label="Padding"
              value={fontSettings.bubblePadding}
              min={4}
              max={20}
              onChange={(v) => updateFontSettings({ bubblePadding: v })}
              unit="px"
            />
          </View>
          <SettingsItem
            icon="cloud-outline"
            label="Drop Shadow"
            description="Add shadow behind speech bubbles"
            noChevron
            last
            right={
              <SettingsToggle
                value={fontSettings.shadow}
                onValueChange={(v) => updateFontSettings({ shadow: v })}
              />
            }
          />
        </SettingsSection>

        <View style={{ height: 6 }} />

        {/* ── Quality ───────────────────────────────────────────────────── */}
        <SettingsSection title="Rendering" icon="hardware-chip-outline" defaultExpanded={false}>
          <SettingsItem
            icon="diamond-outline"
            label="Text Rendering Quality"
            description={`${fontSettings.textQuality.charAt(0).toUpperCase()}${fontSettings.textQuality.slice(1)} — affects performance on older devices`}
            noChevron
            last
            right={
              <SettingsOptionSelector
                options={QUALITY_OPTS}
                selected={fontSettings.textQuality}
                onChange={(v) => updateFontSettings({ textQuality: v as never })}
                layout="row"
              />
            }
          />
        </SettingsSection>

        {/* Reset button */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable
            onPress={handleReset}
            style={[styles.resetAllBtn, { borderColor: colors.destructive }]}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.destructive} />
            <Text style={[styles.resetAllText, { color: colors.destructive }]}>Reset to Defaults</Text>
          </Pressable>
        </View>
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
  resetBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  resetText: { fontSize: 14, fontWeight: "500" as const },
  sectionLabel: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.8, marginBottom: 8, paddingHorizontal: 4 },
  previewCard: { borderWidth: 1, overflow: "hidden" },
  previewPanel: {
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a2e",
  },
  previewDirection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  previewDirectionLabel: { fontSize: 11, fontWeight: "600" as const },
  importRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  importCopy: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  importText: { flex: 1, gap: 2 },
  importDescription: { fontSize: 11, lineHeight: 15 },
  importActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  smallAction: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 7 },
  smallActionText: { fontSize: 11, fontWeight: "600" as const },
  importButton: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8 },
  importButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
  speechBubble: {
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  colorLabel: { fontSize: 13, fontWeight: "500" as const, marginBottom: 6 },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resetAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderWidth: 1,
    borderRadius: 10,
  },
  resetAllText: { fontSize: 14, fontWeight: "600" as const },
});
