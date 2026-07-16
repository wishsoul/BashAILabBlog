import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);

async function readProjectFile(path: string) {
  return readFile(new URL(path, root), "utf8");
}

describe("warning remediation safeguards", () => {
  it("uses the Zod v4 URL API without deprecated string formats", async () => {
    const config = await readProjectFile("src/content.config.ts");

    expect(config).toContain("z.url().optional()");
    expect(config).not.toContain("z.string().url()");
  });

  it("exposes a production-only dependency audit command", async () => {
    const packageJson = JSON.parse(await readProjectFile("package.json"));
    const workflow = await readProjectFile(".github/workflows/deploy.yml");

    expect(packageJson.scripts["audit:production"]).toBe(
      "npm audit --omit=dev --audit-level=moderate",
    );
    expect(workflow).toContain("- run: npm run audit:production");
  });
});
