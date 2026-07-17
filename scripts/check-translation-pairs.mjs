import console from "node:console";
import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import process from "node:process";
import { URL, fileURLToPath, pathToFileURL } from "node:url";

const CONTENT_DIRECTORIES = ["work", "research", "log", "pages"];
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u;

/**
 * @typedef {{ file: string; lang: "en" | "zh"; translationKey: string }} TranslationEntry
 */

/**
 * @param {TranslationEntry[]} entries
 * @returns {string[]}
 */
export function validateTranslationPairs(entries) {
  const byKey = new Map();
  for (const entry of entries) {
    const group = byKey.get(entry.translationKey) ?? { en: [], zh: [] };
    group[entry.lang].push(entry);
    byKey.set(entry.translationKey, group);
  }

  const errors = [];
  for (const [key, group] of byKey) {
    if (group.en.length > 1)
      errors.push(
        "translationKey " +
          key +
          " has " +
          group.en.length +
          " English entries",
      );
    if (group.zh.length > 1)
      errors.push(
        "translationKey " +
          key +
          " has " +
          group.zh.length +
          " Chinese entries",
      );
    for (const entry of group.zh)
      if (group.en.length === 0)
        errors.push(
          entry.file + ": no English source for translationKey " + key,
        );
  }
  return errors;
}

/**
 * @param {URL} directory
 * @returns {URL[]}
 */
function walkMarkdownFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const file = new URL(entry.name, directory);
      if (entry.isDirectory())
        return walkMarkdownFiles(new URL(`${entry.name}/`, directory));
      return entry.isFile() &&
        MARKDOWN_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf(".")))
        ? [file]
        : [];
    });
}

/**
 * @param {string} frontMatter
 * @param {string} name
 * @returns {string | undefined}
 */
function scalar(frontMatter, name) {
  const match = frontMatter.match(
    new RegExp(
      `^${name}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\s#]+))\\s*(?:#.*)?$`,
      "mu",
    ),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

/**
 * @param {URL} contentRoot
 * @returns {TranslationEntry[]}
 */
export function collectTranslationEntries(contentRoot) {
  const rootPath = fileURLToPath(contentRoot);
  const files = CONTENT_DIRECTORIES.flatMap((directory) =>
    walkMarkdownFiles(new URL(`${directory}/`, contentRoot)),
  );

  const entries = files.map((file) => {
    const content = readFileSync(file, "utf8");
    const frontMatter = content.match(FRONT_MATTER_PATTERN)?.[1];
    if (!frontMatter) return undefined;

    const lang = scalar(frontMatter, "lang");
    const translationKey = scalar(frontMatter, "translationKey");
    if ((lang !== "en" && lang !== "zh") || !translationKey) return undefined;

    return {
      file: relative(rootPath, fileURLToPath(file)).replaceAll("\\", "/"),
      lang,
      translationKey,
    };
  });

  return entries.filter((entry) => entry !== undefined);
}

function main() {
  const contentRoot = new URL("../src/content/", import.meta.url);
  const errors = validateTranslationPairs(
    collectTranslationEntries(contentRoot),
  );
  if (errors.length === 0) return;

  for (const error of errors) console.error(error);
  process.exitCode = 1;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
