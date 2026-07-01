import { ar } from "./ar";
import { en } from "./en";

export type Locale = "en" | "ar";

export const languageOptions: Array<{ locale: Locale; label: string; nativeLabel: string }> = [
  { locale: "en", label: en.localeName, nativeLabel: en.nativeName },
  { locale: "ar", label: ar.localeName, nativeLabel: ar.nativeName }
];

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "ar" ? "ar" : "en";
}

export function localeDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function translate(locale: Locale, value: string | number | undefined): string {
  const text = String(value ?? "");
  if (locale === "en") return text;
  return ar[text] ?? text;
}
