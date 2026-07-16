import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);

async function readProjectFile(path: string) {
  return readFile(new URL(path, root), "utf8");
}

describe("GitHub Pages deployment configuration", () => {
  it("uses the repository owner as the project-site canonical origin", async () => {
    const [astroConfig, siteConfig, exampleEnv, workflow, readme] =
      await Promise.all([
        readProjectFile("astro.config.mjs"),
        readProjectFile("src/config/site.ts"),
        readProjectFile(".env.example"),
        readProjectFile(".github/workflows/deploy.yml"),
        readProjectFile("README.md"),
      ]);

    expect(astroConfig).toContain('"https://wishsoul.github.io"');
    expect(siteConfig).toContain('"https://wishsoul.github.io"');
    expect(exampleEnv).toContain("PUBLIC_SITE_URL=https://wishsoul.github.io");
    expect(workflow).toContain("PUBLIC_SITE_URL: https://wishsoul.github.io");
    expect(readme).toContain("https://wishsoul.github.io/BashAILabBlog/");

    for (const source of [
      astroConfig,
      siteConfig,
      exampleEnv,
      workflow,
      readme,
    ]) {
      expect(source).not.toContain("https://bashxu.github.io");
    }
  });
});
