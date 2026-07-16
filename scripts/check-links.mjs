import console from "node:console";
import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const REFERENCE_PATTERN =
  /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/giu;
const EXTERNAL_REFERENCE_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu;

/**
 * @typedef {{ file: string; reference: string; reason: string }} BrokenReference
 */

/**
 * @param {string} basePath
 */
export function normalizeBase(basePath) {
  if (!basePath || basePath === "/") return "/";
  return `/${basePath.replace(/^\/+|\/+$/gu, "")}`;
}

/**
 * @param {string} html
 */
export function extractReferences(html) {
  return [...html.matchAll(REFERENCE_PATTERN)].map(
    (match) => match[1] ?? match[2] ?? match[3] ?? "",
  );
}

/**
 * @param {string} reference
 */
export function isExternalReference(reference) {
  return (
    !reference ||
    reference.startsWith("#") ||
    EXTERNAL_REFERENCE_PATTERN.test(reference)
  );
}

/**
 * @param {string} pathname
 */
function targetFiles(pathname) {
  const cleanedPath = pathname.replace(/\/+$/u, "");
  if (!cleanedPath || cleanedPath.endsWith(".html")) {
    return [cleanedPath || "index.html"];
  }

  return extname(cleanedPath)
    ? [cleanedPath]
    : [`${cleanedPath}/index.html`, `${cleanedPath}.html`];
}

/**
 * @param {string} pathname
 */
function withoutSearchOrHash(pathname) {
  return pathname.split(/[?#]/u, 1)[0];
}

/**
 * @param {string} path
 */
function hasTraversalOutsideDist(path) {
  return path === ".." || path.startsWith(`..${"/"}`);
}

/**
 * @param {{ sourceFile: string; reference: string; basePath: string; files: Set<string> }} options
 * @returns {BrokenReference | null}
 */
export function validateReference({ sourceFile, reference, basePath, files }) {
  if (isExternalReference(reference)) return null;

  const normalizedBase = normalizeBase(basePath);
  const pathname = withoutSearchOrHash(reference);
  let candidatePath;

  if (pathname.startsWith("/")) {
    if (
      normalizedBase !== "/" &&
      pathname !== normalizedBase &&
      !pathname.startsWith(`${normalizedBase}/`)
    ) {
      return {
        file: sourceFile,
        reference,
        reason: `root-relative URL is outside base ${normalizedBase}`,
      };
    }
    candidatePath =
      normalizedBase === "/"
        ? pathname.slice(1)
        : pathname.slice(normalizedBase.length).replace(/^\/+/, "");
  } else {
    candidatePath = relative(
      ".",
      resolve(relative(".", sourceFile), "..", pathname),
    );
  }

  if (hasTraversalOutsideDist(candidatePath)) {
    return {
      file: sourceFile,
      reference,
      reason: "referenced file escapes dist",
    };
  }

  if (targetFiles(candidatePath).some((target) => files.has(target))) {
    return null;
  }

  return {
    file: sourceFile,
    reference,
    reason: "referenced file does not exist",
  };
}

/**
 * @param {string} directory
 * @param {string} current = ""
 * @returns {Promise<string[]>}
 */
async function walkHtmlFiles(directory, current = "") {
  const entries = await readdir(resolve(directory, current), {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const relativePath = `${current}${entry.name}`;
        if (entry.isDirectory()) {
          return walkHtmlFiles(directory, `${relativePath}/`);
        }
        return entry.isFile() && relativePath.endsWith(".html")
          ? [relativePath]
          : [];
      }),
  );
  return files.flat();
}

/**
 * @param {string} directory
 * @param {string} current = ""
 * @returns {Promise<string[]>}
 */
async function walkFiles(directory, current = "") {
  const entries = await readdir(resolve(directory, current), {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const relativePath = `${current}${entry.name}`;
        if (entry.isDirectory()) {
          return walkFiles(directory, `${relativePath}/`);
        }
        return entry.isFile() ? [relativePath] : [];
      }),
  );
  return files.flat();
}

/**
 * @param {string} distDirectory
 * @param {string} basePath
 * @returns {Promise<BrokenReference[]>}
 */
export async function validateDist(distDirectory, basePath) {
  const [htmlFiles, files] = await Promise.all([
    walkHtmlFiles(distDirectory),
    walkFiles(distDirectory),
  ]);
  const fileSet = new Set(files);
  const validations = await Promise.all(
    htmlFiles.map(async (sourceFile) => {
      const html = await readFile(resolve(distDirectory, sourceFile), "utf8");
      return extractReferences(html)
        .map((reference) =>
          validateReference({
            sourceFile,
            reference,
            basePath,
            files: fileSet,
          }),
        )
        .filter((issue) => issue !== null);
    }),
  );

  return validations
    .flat()
    .sort(
      (left, right) =>
        left.file.localeCompare(right.file) ||
        left.reference.localeCompare(right.reference),
    );
}

async function main() {
  const issues = await validateDist(
    resolve("dist"),
    process.env.PUBLIC_BASE_PATH ?? "/BashAILabBlog",
  );

  if (issues.length === 0) return;

  for (const issue of issues) {
    console.error(`${issue.file}: ${issue.reference} (${issue.reason})`);
  }
  process.exitCode = 1;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
