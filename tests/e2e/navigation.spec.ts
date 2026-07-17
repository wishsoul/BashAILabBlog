import { expect, test } from "@playwright/test";

test("uses the Chinese profile URL in every global GitHub link", async ({
  page,
}) => {
  await page.goto("./");
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "GitHub" }),
  ).toHaveAttribute("href", "https://github.com/wishsoul");
  await expect(
    page.locator("footer").getByRole("link", { name: "GitHub" }),
  ).toHaveAttribute("href", "https://github.com/wishsoul");
});

test("keeps Chinese navigation inside the Chinese edition", async ({
  page,
}) => {
  await page.goto("./zh/");
  await expect(
    page
      .getByRole("navigation", { name: "主导航" })
      .getByRole("link", { name: "作品" }),
  ).toHaveAttribute("href", "/BashAILabBlog/zh/work/");
});

test("desktop navigation identifies the current page and keeps internal links base-safe", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("./");

  const primaryNavigation = page.getByRole("navigation", { name: "Primary" });
  await expect(primaryNavigation).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Bash AI Lab", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    primaryNavigation.getByRole("link", { name: "Work" }),
  ).toHaveAttribute("href", "/BashAILabBlog/work/");
  await expect(
    primaryNavigation.getByRole("link", { name: "GitHub" }),
  ).toHaveAttribute("rel", "noopener noreferrer");
});

test("mobile navigation handles rapid toggles and leaves hidden links unfocusable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  const trigger = page.getByRole("button", { name: "Menu" });
  const mobileNavigation = page.getByRole("navigation", {
    name: "Mobile",
    includeHidden: true,
  });
  const panel = page.locator("[data-mobile-navigation-panel]");
  const workLink = mobileNavigation.getByRole("link", {
    name: "Work",
    includeHidden: true,
  });

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(mobileNavigation).toBeHidden();
  await expect(workLink).toBeHidden();
  await expect(panel).toHaveJSProperty("hidden", true);
  expect(
    await panel.evaluate(
      (element) => getComputedStyle(element).transitionProperty,
    ),
  ).toContain("display");

  await trigger.click({ clickCount: 4 });
  await expect(trigger).toHaveAccessibleName("Menu");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(mobileNavigation).toBeHidden();
  await expect(panel).toHaveJSProperty("hidden", true);
  await expect(workLink).toBeHidden();

  await workLink.evaluate((link) => link.focus());
  await expect(workLink).not.toBeFocused();
});

test("mobile navigation removes panel movement for reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.locator("[data-mobile-navigation-panel]")).toHaveCSS(
    "transform",
    "none",
  );
});

test("mobile navigation closes on Escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  const trigger = page.getByRole("button", { name: "Menu" });
  await trigger.click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("theme choice updates its accessible label and persists after reload", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");

  const toggle = page.locator("[data-theme-toggle]");
  await expect(toggle).toHaveAccessibleName("Use dark theme");
  await toggle.click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAccessibleName("Use light theme");
  expect(await page.evaluate(() => localStorage.theme)).toBe("dark");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Use light theme" }),
  ).toBeVisible();
});

test("theme toggle reflects the system preference when no choice is stored", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.removeItem("theme"));
  await page.goto("./");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Use light theme" }),
  ).toBeVisible();
});

test("language switch falls back to the base-safe Chinese edition route", async ({
  page,
}) => {
  await page.goto("./");

  await expect(
    page.getByRole("link", { name: "切换到中文" }).first(),
  ).toHaveAttribute("href", "/BashAILabBlog/zh/");
});

test("header exposes only a data attribute when the page is scrolled", async ({
  page,
}) => {
  await page.goto("./");

  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-scrolled", "false");

  await page.evaluate(() => window.scrollTo(0, 200));

  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect(header).not.toHaveClass(/scrolled/);
});
