import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("launch content files", () => {
  it("contains only the approved honest Work profiles", () => {
    const files = readdirSync(
      new URL("../../src/content/work/en/", import.meta.url),
    ).sort();

    expect(files).toEqual([
      "mac-native-kit.mdx",
      "pastepop.mdx",
      "tidypilot.mdx",
      "wordgrill.mdx",
    ]);

    for (const file of files) {
      const source = readFileSync(
        new URL(`../../src/content/work/en/${file}`, import.meta.url),
        "utf8",
      );

      expect(source).toContain("lang: en");
      expect(source).toContain("draft: false");
      expect(source).not.toMatch(/^cover:/mu);
      expect(source).not.toMatch(/\b\d+(?:\.\d+)?%\b/u);
    }
  });
});
