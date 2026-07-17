import { expect, test } from "@playwright/test";

const HOME_SECTION_ORDER = [
  "hero",
  "current-research",
  "selected-work",
  "latest-research",
  "lab-status",
];

test("does not introduce horizontal overflow at the 320px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("./");
  await page.evaluate(() =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("keeps the homepage source and visual reading order aligned at 768px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("./");

  const sections = await page
    .locator("[data-home-section]")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.getAttribute("data-home-section"),
        top: node.getBoundingClientRect().top,
      })),
    );

  expect(sections.map(({ name }) => name)).toEqual(HOME_SECTION_ORDER);
  expect(
    sections.every(
      (section, index) => index === 0 || section.top > sections[index - 1].top,
    ),
  ).toBe(true);
});

test("caps research prose at a readable desktop line length", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./research/from-l3-to-l4-agentic-development/");

  const lineLength = await page
    .locator("[data-content-prose]")
    .evaluate((prose) => {
      const styles = getComputedStyle(prose);
      const context = document.createElement("canvas").getContext("2d");
      if (!context) throw new Error("Canvas text measurement is unavailable");

      context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const averageCharacterWidth =
        context.measureText(alphabet).width / alphabet.length;
      return prose.getBoundingClientRect().width / averageCharacterWidth;
    });

  expect(lineLength).toBeGreaterThanOrEqual(45);
  expect(lineLength).toBeLessThanOrEqual(75);
});
