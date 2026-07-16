import type { Locale } from "../config/site";

export type Entry<T> = { id: string; data: T };

export function visibleEntries<E extends Entry<{ draft: boolean }>>(
  entries: E[],
  production: boolean,
): E[] {
  return production ? entries.filter((entry) => !entry.data.draft) : entries;
}

export function sortByOrderThenDate<
  E extends Entry<{ order?: number; publishedAt?: Date | null }>,
>(entries: E[]): E[] {
  return [...entries].sort(
    (a, b) =>
      (a.data.order ?? Number.MAX_SAFE_INTEGER) -
        (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
      (b.data.publishedAt?.getTime() ?? 0) -
        (a.data.publishedAt?.getTime() ?? 0),
  );
}

export function pairTranslations<
  T extends { lang: Locale; translationKey: string },
>(entries: Entry<T>[]) {
  const pairs = new Map<string, Map<Locale, Entry<T>>>();

  for (const entry of entries) {
    const group =
      pairs.get(entry.data.translationKey) ?? new Map<Locale, Entry<T>>();
    group.set(entry.data.lang, entry);
    pairs.set(entry.data.translationKey, group);
  }

  return pairs;
}

export function contentSlug(id: string): string {
  return id.replace(/^(?:en|zh)\//, "").replace(/\.(?:md|mdx)$/, "");
}

export function estimateReadingMinutes(text: string): number {
  return Math.max(
    1,
    Math.ceil(text.trim().split(/\s+/u).filter(Boolean).length / 220),
  );
}
