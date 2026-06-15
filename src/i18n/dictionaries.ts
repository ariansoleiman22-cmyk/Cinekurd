import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

// Each dictionary is lazily loaded so only the requested language is bundled.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("../dictionaries/en.json").then((m) => m.default),
  ar: () => import("../dictionaries/ar.json").then((m) => m.default as Dictionary),
  ckb: () => import("../dictionaries/ckb.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
