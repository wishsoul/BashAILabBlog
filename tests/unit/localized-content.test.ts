import { expect, it } from "vitest";
import {
  contentPath,
  localizedPath,
  translationPath,
} from "../../src/lib/localized-content";

it("uses stable Chinese and English content routes", () => {
  expect(localizedPath("zh", "/work/")).toBe("/zh/work/");
  expect(contentPath("zh", "research", "zh/ai-native-interfaces.mdx")).toBe(
    "/zh/research/ai-native-interfaces/",
  );
  expect(contentPath("en", "pages", "en/about.mdx")).toBe("/about/");
});

it("returns the paired detail route from translationKey", () => {
  const en = {
    id: "en/demo.mdx",
    data: { lang: "en" as const, translationKey: "work.demo" },
  };
  const zh = {
    id: "zh/demo.mdx",
    data: { lang: "zh" as const, translationKey: "work.demo" },
  };

  expect(translationPath([en, zh], en, "work")).toBe("/zh/work/demo/");
});

it("returns undefined when a translation counterpart is unavailable", () => {
  const en = {
    id: "en/demo.mdx",
    data: { lang: "en" as const, translationKey: "work.demo" },
  };

  expect(translationPath([en], en, "work")).toBeUndefined();
});
