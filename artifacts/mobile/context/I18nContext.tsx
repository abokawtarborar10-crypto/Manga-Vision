import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
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
            // Keep the established component hierarchy and physical placement
            // stable. Text direction is applied explicitly to text boundaries;
            // putting the selected locale direction on this root View reverses
            // every flex row and lets native icon glyphs be mirrored globally.
            direction: "ltr",
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