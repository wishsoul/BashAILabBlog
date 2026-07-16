import type { Locale } from "../config/site";
import { contentSlug, pairTranslations, type Entry } from "./content";

export function localizedPath(locale: Locale, path: string): string {
  const normalized = "/" + path.replace(/^\/+/, "");
  return locale === "zh" ? "/zh" + normalized : normalized;
}

export function contentPath(
  locale: Locale,
  collection: "work" | "research" | "pages",
  id: string,
): string {
  const slug = contentSlug(id);
  return localizedPath(
    locale,
    collection === "pages"
      ? "/" + slug + "/"
      : "/" + collection + "/" + slug + "/",
  );
}

export function translationPath<
  T extends { lang: Locale; translationKey: string },
  E extends Entry<T>,
>(
  entries: E[],
  entry: E,
  collection: "work" | "research" | "pages",
): string | undefined {
  const counterpartLocale = entry.data.lang === "en" ? "zh" : "en";
  const counterpart = pairTranslations(entries)
    .get(entry.data.translationKey)
    ?.get(counterpartLocale);

  return counterpart
    ? contentPath(counterpart.data.lang, collection, counterpart.id)
    : undefined;
}
