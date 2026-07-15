import { expect, test } from "@playwright/test";

test("loads the English shell with readable tokens", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Bash AI Lab/);
  await expect(page.getByRole("contentinfo")).toContainText("Built with Astro");
  const bodySize = await page
    .locator("body")
    .evaluate((node) => getComputedStyle(node).fontSize);
  expect(Number.parseFloat(bodySize)).toBeGreaterThanOrEqual(15);
});
