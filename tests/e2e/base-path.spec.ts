import { expect, test } from "@playwright/test";

const directWorkReferences = (page: import("@playwright/test").Page) =>
  page.locator("[href], [src]").evaluateAll((elements) =>
    elements
      .flatMap((element) =>
        ["href", "src"].map((attribute) => element.getAttribute(attribute)),
      )
      .filter((reference) => {
        if (!reference?.startsWith("/work/")) return false;
        return new URL(reference, window.location.href).pathname === "/work/";
      }),
  );

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

test("does not emit direct local /work/ references in generated pages", async ({
  page,
}) => {
  const sitemap = await page.request.get("/BashAILabBlog/sitemap-0.xml");
  expect(sitemap.ok()).toBe(true);
  const routes = await page.evaluate(
    (xml) => {
      const document = new DOMParser().parseFromString(xml, "application/xml");
      return [...document.querySelectorAll("loc")].map(
        (location) =>
          new URL(location.textContent ?? "", window.location.href).pathname,
      );
    },
    await sitemap.text(),
  );

  for (const route of [...routes, "/BashAILabBlog/404.html"]) {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);

    expect(await directWorkReferences(page)).toEqual([]);
  }
});

test("checks href and src independently when an element has both", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() => {
    const element = document.createElement("a");
    element.setAttribute("href", "/BashAILabBlog/work/");
    element.setAttribute("src", "/work/");
    document.body.append(element);
  });

  await expect(directWorkReferences(page)).resolves.toEqual(["/work/"]);
});
