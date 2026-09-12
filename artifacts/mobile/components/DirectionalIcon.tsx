import { Ionicons } from "@expo/vector-icons";
import React from "react";
import type { ComponentProps } from "react";
import { useI18n } from "@/context/I18nContext";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const RTL_ICON_PAIRS: Record<string, string> = {
  "arrow-back": "arrow-forward",
  "arrow-forward": "arrow-back",
  "arrow-back-outline": "arrow-forward-outline",
  "arrow-forward-outline": "arrow-back-outline",
  "arrow-back-circle": "arrow-forward-circle",
  "arrow-forward-circle": "arrow-back-circle",
  "arrow-back-circle-outline": "arrow-forward-circle-outline",
  "arrow-forward-circle-outline": "arrow-back-circle-outline",
  "chevron-back": "chevron-forward",
  "chevron-forward": "chevron-back",
  "chevron-back-outline": "chevron-forward-outline",
  "chevron-forward-outline": "chevron-back-outline",
  "caret-back": "caret-forward",
  "caret-forward": "caret-back",
  "caret-back-outline": "caret-forward-outline",
  "caret-forward-outline": "caret-back-outline",
};

export function resolveDirectionalIcon(name: string, isRTL: boolean): string {
  return isRTL ? RTL_ICON_PAIRS[name] ?? name : name;
}

type DirectionalIconProps = Omit<ComponentProps<typeof Ionicons>, "name"> & {
  name: IoniconName;
};

/**
 * Mirrors only icons whose meaning is tied to reading/navigation direction.
 * Brand marks, artwork, and generic action icons should use Ionicons directly.
 */
export function DirectionalIcon({ name, ...props }: DirectionalIconProps) {
  const { isRTL } = useI18n();
  return (
    <Ionicons
      {...props}
      name={resolveDirectionalIcon(String(name), isRTL) as IoniconName}
    />
  );
}