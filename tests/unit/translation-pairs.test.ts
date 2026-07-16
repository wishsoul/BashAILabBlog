import { describe, expect, it } from "vitest";
import { validateTranslationPairs } from "../../scripts/check-translation-pairs.mjs";

describe("translation-pair validation", () => {
  it("accepts one English source with one Chinese translation", () => {
    expect(
      validateTranslationPairs([
        { file: "work/en/demo.mdx", lang: "en", translationKey: "work.demo" },
        { file: "work/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
      ]),
    ).toEqual([]);
  });

  it("rejects a Chinese entry without an English source", () => {
    expect(
      validateTranslationPairs([
        { file: "work/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
      ]),
    ).toContain(
      "work/zh/demo.mdx: no English source for translationKey work.demo",
    );
  });

  it("rejects duplicate keys in either language", () => {
    expect(
      validateTranslationPairs([
        { file: "work/en/demo.mdx", lang: "en", translationKey: "work.demo" },
        {
          file: "research/en/demo.mdx",
          lang: "en",
          translationKey: "work.demo",
        },
        { file: "work/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
        {
          file: "research/zh/demo.mdx",
          lang: "zh",
          translationKey: "work.demo",
        },
      ]),
    ).toEqual(
      expect.arrayContaining([
        "translationKey work.demo has 2 English entries",
        "translationKey work.demo has 2 Chinese entries",
      ]),
    );
  });
});
