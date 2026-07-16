import { describe, expect, it } from "vitest";
import {
  buildArticleJsonLd,
  buildCanonical,
  buildLanguageAlternates,
  buildWorkJsonLd,
} from "../../src/lib/seo";

const config = {
  name: "Bash AI Lab",
  description: "AI product research and independent software.",
  siteUrl: "https://bashxu.github.io",
  basePath: "/BashAILabBlog",
  defaultLocale: "en" as const,
};

const article = {
  title: "A research note",
  description: "A factual research description.",
  canonicalPath: "/research/a-research-note/",
  publishedAt: new Date("2026-07-09T00:00:00.000Z"),
};

describe("SEO metadata", () => {
  it("builds base-aware canonical URLs", () => {
    expect(buildCanonical("/research/", config)).toBe(
      "https://bashxu.github.io/BashAILabBlog/research/",
    );
  });

  it("uses Article structured data for research", () => {
    expect(buildArticleJsonLd(article, config)["@type"]).toBe("Article");
  });

  it("uses SoftwareApplication structured data for Products", () => {
    expect(
      buildWorkJsonLd(
        {
          ...article,
          category: "Products",
          platform: "macOS",
        },
        config,
      )["@type"],
    ).toBe("SoftwareApplication");
  });

  it("uses CreativeWork structured data for Infrastructure", () => {
    expect(
      buildWorkJsonLd(
        {
          ...article,
          category: "Infrastructure",
          platform: "macOS",
        },
        config,
      )["@type"],
    ).toBe("CreativeWork");
  });

  it("does not emit a Chinese alternate without a real translation", () => {
    expect(
      buildLanguageAlternates(
        { lang: "en", canonicalPath: "/research/" },
        config,
      ),
    ).not.toContainEqual(expect.objectContaining({ hrefLang: "zh" }));
  });
});
