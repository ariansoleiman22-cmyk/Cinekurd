// Client-safe primitives (no Prisma/server imports) — usable in Client Components.

export type Trilingual = { en: string; ar: string; ckb: string };
export type Spec = { label: string; value: string };

export const CATEGORIES = ["camera", "lens", "light", "accessories"] as const;
export type Category = (typeof CATEGORIES)[number];

export const ACCESSORY_SUBTYPES = [
  "stand",
  "gimbal",
  "monitor",
  "tripod",
  "matte-box",
  "follow-focus",
  "wireless-video",
  "battery",
  "audio",
  "media",
] as const;
export type AccessorySubtype = (typeof ACCESSORY_SUBTYPES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
