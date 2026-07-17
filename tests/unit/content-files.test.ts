import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const percentageClaimPattern = /\b\d+(?:\.\d+)?%/u;

describe("launch content files", () => {
  it("detects ordinary percentage claims", () => {
    expect("95% improvement").toMatch(percentageClaimPattern);
  });

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

      expect(source).toMatch(/^lang: en$/mu);
      expect(source).toMatch(/^draft: false$/mu);
      expect(source).toMatch(
        file === "mac-native-kit.mdx" ? /^year: 2026$/mu : /^year: null$/mu,
      );
      expect(source).toMatch(
        file === "mac-native-kit.mdx"
          ? /^startedAt: 2026-06$/mu
          : /^startedAt: null$/mu,
      );
      expect(source).toMatch(
        file === "mac-native-kit.mdx"
          ? /^role: Product strategy, system design, and implementation$/mu
          : /^role: Role details not yet supplied$/mu,
      );
      expect(source).toMatch(
        file === "mac-native-kit.mdx"
          ? /^description: Let AI describe native macOS UI intent without giving it unrestricted control over SwiftUI\.$/mu
          : /^description: .+$/mu,
      );
      expect(source).not.toMatch(/^cover:/mu);
      expect(source).not.toMatch(percentageClaimPattern);

      if (file !== "mac-native-kit.mdx") {
        expect(source).toMatch(
          /^## My Role\n\nRole details not yet supplied$/mu,
        );
      }
    }
  });

  it("keeps WordGrill platform metadata canonical for structured data", () => {
    const source = readFileSync(
      new URL("../../src/content/work/zh/wordgrill.mdx", import.meta.url),
      "utf8",
    );

    expect(source).toMatch(/^platform: iOS and macOS$/mu);
  });

  it("keeps undated Research drafts isolated from published articles", () => {
    const draftFiles = [
      "github-issues-source-of-truth.mdx",
      "human-checkpoints-autonomous-development.mdx",
    ];
    const publishedFiles = [
      "designing-constraint-system-ai-ui.mdx",
      "from-l3-to-l4-agentic-development.mdx",
      "why-functional-tests-fail-user-journeys.mdx",
    ];

    for (const file of draftFiles) {
      const source = readFileSync(
        new URL(`../../src/content/research/en/${file}`, import.meta.url),
        "utf8",
      );

      expect(source).toMatch(/^draft: true$/mu);
      expect(source).toMatch(/^publishedAt: null$/mu);
    }

    for (const file of publishedFiles) {
      const source = readFileSync(
        new URL(`../../src/content/research/en/${file}`, import.meta.url),
        "utf8",
      );

      expect(source).toMatch(/^draft: false$/mu);
      expect(source).toMatch(/^publishedAt: \d{4}-\d{2}-\d{2}$/mu);
      expect(source).not.toMatch(/^draft: true$/mu);
      expect(source).not.toMatch(/^publishedAt: null$/mu);
    }
  });
});
