import type { Locale } from "../config/site";
import { en, type UiCopy } from "./en";
import { zh } from "./zh";

const UI = { en, zh } satisfies Record<Locale, UiCopy>;

export function getUi(locale: Locale): UiCopy {
  return UI[locale];
}

export { en, zh };
export type { UiCopy };
