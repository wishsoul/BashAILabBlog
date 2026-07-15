import { describe, expect, it } from "vitest";
import {
  contentSlug,
  estimateReadingMinutes,
  pairTranslations,
  sortByOrderThenDate,
  visibleEntries,
} from "../../src/lib/content";

const entries = [
  {
    id: "b",
    data: {
      draft: false,
      order: 2,
      publishedAt: new Date("2026-07-15"),
    },
  },
  {
    id: "a",
    data: {
      draft: false,
      order: 1,
      publishedAt: new Date("2026-07-14"),
    },
  },
  {
    id: "draft",
    data: {
      draft: true,
      order: 0,
      publishedAt: new Date("2026-07-16"),
    },
  },
];

describe("content helpers", () => {
  it("removes drafts for production", () =>
    expect(visibleEntries(entries, true).map((entry) => entry.id)).toEqual([
      "b",
      "a",
    ]));

  it("sorts order before reverse date", () =>
    expect(sortByOrderThenDate(entries).map((entry) => entry.id)).toEqual([
      "draft",
      "a",
      "b",
    ]));

  it("pairs translations by key", () => {
    const paired = pairTranslations([
      { id: "en", data: { lang: "en" as const, translationKey: "about" } },
      { id: "zh", data: { lang: "zh" as const, translationKey: "about" } },
    ]);

    expect(paired.get("about")?.get("zh")?.id).toBe("zh");
  });

  it("removes locale folders and content extensions from slugs", () => {
    expect(contentSlug("en/mac-native-kit.mdx")).toBe("mac-native-kit");
  });

  it("returns at least one reading minute", () =>
    expect(estimateReadingMinutes("short note")).toBe(1));
});
