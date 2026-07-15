import { expect, test } from "@playwright/test";

test("loads the English shell with readable tokens", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Bash AI Lab/);
  await expect(page.getByRole("contentinfo")).toContainText("Built with Astro");

  const bodyStyles = await page.locator("body").evaluate((node) => {
    const styles = getComputedStyle(node);
    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
    };
  });
  expect(bodyStyles).toEqual({
    backgroundColor: "rgb(245, 245, 241)",
    color: "rgb(17, 17, 17)",
    fontFamily: '"Geist Variable", system-ui, sans-serif',
    fontSize: "15px",
  });

  const resumeLink = page.getByRole("link", { name: "Resume" });
  await resumeLink.hover();
  await expect
    .poll(() => resumeLink.evaluate((node) => getComputedStyle(node).color))
    .toBe("rgb(17, 17, 17)");

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/BashAILabBlog/favicon.svg",
  );
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute(
    "href",
    /^\/BashAILabBlog\/_astro\/index\.[\w-]+\.css$/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:4321/BashAILabBlog/",
  );

  const fontAssetPaths = await page.evaluate(async () => {
    await document.fonts.ready;
    return performance
      .getEntriesByType("resource")
      .map((entry) => new URL(entry.name).pathname)
      .filter((path) => path.endsWith(".woff2"));
  });
  expect(fontAssetPaths).toEqual(
    expect.arrayContaining([
      expect.stringMatching(
        /^\/BashAILabBlog\/_astro\/geist-latin-wght-normal\.[\w-]+\.woff2$/,
      ),
      expect.stringMatching(
        /^\/BashAILabBlog\/_astro\/geist-mono-latin-wght-normal\.[\w-]+\.woff2$/,
      ),
    ]),
  );

  const externalLinks = page
    .getByRole("contentinfo")
    .locator('a[target="_blank"]');
  await expect(externalLinks).toHaveCount(2);
  for (const externalLink of await externalLinks.all()) {
    await expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(externalLink.locator('[aria-hidden="true"]')).toHaveText("↗");
    await expect(externalLink.locator(".visually-hidden")).toContainText(
      "Opens in a new tab",
    );
  }
});

test("stored theme takes precedence over the system preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    localStorage.theme = "light";
  });

  await page.goto("./");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 245, 241)",
  );
  await expect(page.locator("body")).toHaveCSS("color", "rgb(17, 17, 17)");
});

test("system dark preference supplies exact readable dark tokens", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    localStorage.removeItem("theme");
  });

  await page.goto("./");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(11, 11, 12)",
  );
  await expect(page.locator("body")).toHaveCSS("color", "rgb(241, 241, 238)");

  const resumeLink = page.getByRole("link", { name: "Resume" });
  await resumeLink.hover();
  await expect
    .poll(() => resumeLink.evaluate((node) => getComputedStyle(node).color))
    .toBe("rgb(241, 241, 238)");
});
