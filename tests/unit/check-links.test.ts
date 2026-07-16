import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateDist } from "../../scripts/check-links.mjs";

const fixtureDirectories: string[] = [];

async function createFixture(files: Record<string, string>): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "check-links-"));
  fixtureDirectories.push(directory);

  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const target = join(directory, file);
      await mkdir(join(target, ".."), { recursive: true });
      await writeFile(target, content);
    }),
  );

  return directory;
}

afterEach(async () => {
  await Promise.all(
    fixtureDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("validateDist", () => {
  it("accepts base-prefixed clean routes, assets, and external URLs", async () => {
    const distDirectory = await createFixture({
      "index.html": `
        <a href="/BashAILabBlog/work/">Work</a>
        <img src="/BashAILabBlog/favicon.svg">
        <a href="https://example.com/research">External</a>
      `,
      "favicon.svg": "<svg></svg>",
      "work/index.html": "<h1>Work</h1>",
    });

    await expect(
      validateDist(distDirectory, "/BashAILabBlog"),
    ).resolves.toEqual([]);
  });

  it("rejects root-relative routes outside the configured base", async () => {
    const distDirectory = await createFixture({
      "index.html": '<a href="/work/">Work</a>',
      "work/index.html": "<h1>Work</h1>",
    });

    await expect(
      validateDist(distDirectory, "/BashAILabBlog"),
    ).resolves.toEqual([
      expect.objectContaining({
        file: "index.html",
        reference: "/work/",
        reason: "root-relative URL is outside base /BashAILabBlog",
      }),
    ]);
  });

  it("reports missing local assets with their source filename", async () => {
    const distDirectory = await createFixture({
      "research/index.html": '<img src="/BashAILabBlog/images/missing.png">',
    });

    await expect(
      validateDist(distDirectory, "/BashAILabBlog"),
    ).resolves.toEqual([
      expect.objectContaining({
        file: "research/index.html",
        reference: "/BashAILabBlog/images/missing.png",
        reason: "referenced file does not exist",
      }),
    ]);
  });
});
