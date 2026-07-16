import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectTranslationEntries,
  validateTranslationPairs,
} from "../../scripts/check-translation-pairs.mjs";

const fixtureDirectories: string[] = [];

async function createContentFixture(
  files: Record<string, string>,
): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "translation-pairs-"));
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

describe("translation-pair validation", () => {
  it("collects parsed entries synchronously from a content directory", async () => {
    const directory = await createContentFixture({
      "work/en/demo.mdx": "---\nlang: en\ntranslationKey: work.demo\n---\n",
      "work/zh/demo.md": "---\ntranslationKey: work.demo\nlang: zh\n---\n",
      "research/.gitkeep": "",
      "log/.gitkeep": "",
      "pages/.gitkeep": "",
    });

    const entries = collectTranslationEntries(pathToFileURL(`${directory}/`));

    expect(entries.filter((entry) => entry.lang === "zh")).toEqual([
      { file: "work/zh/demo.md", lang: "zh", translationKey: "work.demo" },
    ]);
    expect(entries).toContainEqual({
      file: "work/en/demo.mdx",
      lang: "en",
      translationKey: "work.demo",
    });
  });

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
