// Locale configuration — safe to import from both Server and Client Components.

export const locales = ["en", "ar", "ckb"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Arabic and Kurdish Sorani are written right-to-left.
export const rtlLocales: readonly Locale[] = ["ar", "ckb"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isRtl(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export function dirFor(locale: string): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

// Native name shown in the language switcher.
export const localeNames: Record<Locale, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  ar: { native: "العربية", english: "Arabic" },
  ckb: { native: "کوردی", english: "Kurdish" },
};
