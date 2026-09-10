import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nManager, Platform, View } from "react-native";
import { I18nextProvider } from "react-i18next";
import {
  i18n,
  languageDirection,
  type AppDirection,
  type AppLanguage,
} from "@/i18n";
import { useSettings } from "@/context/SettingsContext";

interface I18nContextValue {
  language: AppLanguage;
  direction: AppDirection;
  isRTL: boolean;
  languageReady: boolean;
}

const I18nRuntimeContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { appLanguage, settingsReady } = useSettings();
  const [languageReady, setLanguageReady] = useState(false);
  const direction = languageDirection(appLanguage);
  const isRTL = direction === "rtl";

  useEffect(() => {
    if (!settingsReady) return;

    let active = true;
    void i18n.changeLanguage(appLanguage).then(() => {
      if (active) setLanguageReady(true);
    });

    // I18nManager keeps native directional semantics aligned with the selected
    // locale. The root direction style below also updates the mounted tree
    // immediately, without requiring an app restart.
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);

    return () => {
      active = false;
    };
  }, [appLanguage, isRTL, settingsReady]);

  const value = useMemo(
    () => ({ language: appLanguage, direction, isRTL, languageReady }),
    [appLanguage, direction, isRTL, languageReady]
  );

  return (
    <I18nextProvider i18n={i18n}>
      <I18nRuntimeContext.Provider value={value}>
        <View
          style={{
            flex: 1,
            direction,
            ...(Platform.OS === "web" ? { writingDirection: direction } : {}),
          }}
        >
          {children}
        </View>
      </I18nRuntimeContext.Provider>
    </I18nextProvider>
  );
}

export function useI18n() {
  const context = useContext(I18nRuntimeContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}