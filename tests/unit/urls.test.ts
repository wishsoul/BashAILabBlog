import { describe, expect, it } from "vitest";
import { absoluteUrl, normalizeBase, withBase } from "../../src/lib/urls";

describe("URL helpers", () => {
  it("normalizes an empty or project base", () => {
    expect(normalizeBase("")).toBe("/");
    expect(normalizeBase("BashAILabBlog/")).toBe("/BashAILabBlog/");
  });

  it("prefixes internal routes once", () => {
    expect(withBase("/work/", "/BashAILabBlog")).toBe("/BashAILabBlog/work/");
    expect(withBase("/BashAILabBlog/work/", "/BashAILabBlog")).toBe(
      "/BashAILabBlog/work/",
    );
  });

  it("leaves external and fragment links unchanged", () => {
    expect(withBase("https://github.com/bashxu", "/BashAILabBlog")).toBe(
      "https://github.com/bashxu",
    );
    expect(withBase("#main", "/BashAILabBlog")).toBe("#main");
  });

  it("builds the canonical project URL", () => {
    expect(
      absoluteUrl("/work/", {
        siteUrl: "https://bashxu.github.io",
        basePath: "/BashAILabBlog",
      }),
    ).toBe("https://bashxu.github.io/BashAILabBlog/work/");
  });
});
