import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

async function htmlFiles(directory: string, current = ""): Promise<string[]> {
  const entries = await readdir(resolve(directory, current), {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const file = `${current}${entry.name}`;
      if (entry.isDirectory()) return htmlFiles(directory, `${file}/`);
      return entry.isFile() && file.endsWith(".html") ? [file] : [];
    }),
  );
  return files.flat();
}

test("serves pages, assets, and feeds beneath the GitHub Pages base path", async ({
  page,
}) => {
  const home = await page.goto("./");
  expect(home?.ok()).toBe(true);

  const stylesheet = page.locator('link[rel="stylesheet"]').first();
  await expect(stylesheet).toHaveAttribute("href", /^\/BashAILabBlog\//u);
  await expect(page.locator('link[rel~="icon"]')).toHaveAttribute(
    "href",
    "/BashAILabBlog/favicon.svg",
  );
  await expect(
    page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Work",
    }),
  ).toHaveAttribute("href", "/BashAILabBlog/work/");

  const work = await page.goto("./work/mac-native-kit/");
  expect(work?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", { level: 1, name: "MacNativeKit" }),
  ).toBeVisible();

  const research = await page.goto(
    "./research/from-l3-to-l4-agentic-development/",
  );
  expect(research?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "From L3 to L4 Agentic Software Development",
    }),
  ).toBeVisible();

  const rss = await page.request.get("/BashAILabBlog/rss.xml");
  expect(rss.ok()).toBe(true);
  expect(await rss.text()).toContain("<rss");

  const missing = await page.goto("./missing-page/");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
});

test("does not emit direct /work/ links in generated HTML", async () => {
  const files = await htmlFiles(resolve("dist"));
  const documents = await Promise.all(
    files.map((file) => readFile(resolve("dist", file), "utf8")),
  );

  expect(documents.join("\n")).not.toContain('href="/work/"');
});
