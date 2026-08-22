import { expect, test } from "@playwright/test";

test("makes the skip link the first keyboard stop and preserves heading hierarchy", async ({
  page,
}) => {
  await page.goto("./");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const headingLevels = await page
    .locator("main :is(h1, h2, h3, h4, h5, h6)")
    .evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1))),
    );
  expect(headingLevels.filter((level) => level === 1)).toHaveLength(1);
  expect(headingLevels[0]).toBe(1);
  expect(
    headingLevels.every(
      (level, index) => index === 0 || level <= headingLevels[index - 1] + 1,
    ),
  ).toBe(true);
});

test("takes a keyboard user through every visible desktop header control with a visible focus ring", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");

  const header = page.getByRole("banner");
  const controls = [
    header.getByRole("link", { name: "Bash AI Lab", exact: true }),
    header.getByRole("link", { name: "Work", exact: true }),
    header.getByRole("link", { name: "Research", exact: true }),
    header.getByRole("link", { name: "Log", exact: true }),
    header.getByRole("link", { name: "About", exact: true }),
    header.getByRole("link", { name: /^GitHub/u }),
    header.getByRole("link", { name: "切换到中文", exact: true }),
    header.getByRole("button", { name: "Use dark theme", exact: true }),
  ];

  await page.keyboard.press("Tab");
  for (const control of controls) {
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();

    const focusIndicator = await control.evaluate((element) => {
      const styles = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        height: rect.height,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        width: rect.width,
      };
    });
    expect(focusIndicator.outlineStyle).toBe("solid");
    expect(focusIndicator.outlineWidth).toBe("2px");
    expect(focusIndicator.width).toBeGreaterThan(0);
    expect(focusIndicator.height).toBeGreaterThan(0);
  }
});

test("resolves reduced-motion styles and accessible contrast-critical tokens", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");

  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  const transitionDuration = Number.parseFloat(
    await page
      .locator(".theme-toggle__disc")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  );
  expect(transitionDuration).toBe(0);

  const contrastRatios = await page.evaluate(() => {
    const luminance = (color: string) => {
      const hex =
        color.length === 4
          ? `#${[...color.slice(1)].map((channel) => channel.repeat(2)).join("")}`
          : color;
      const channels = hex
        .match(/[\da-f]{2}/giu)
        ?.map((channel) => Number.parseInt(channel, 16) / 255);
      if (!channels || channels.length !== 3)
        throw new Error(`Invalid color: ${hex}`);

      const [red, green, blue] = channels.map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      );
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const contrast = (foreground: string, background: string) => {
      const [lighter, darker] = [
        luminance(foreground),
        luminance(background),
      ].sort((first, second) => second - first);
      return (lighter + 0.05) / (darker + 0.05);
    };
    const token = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const ratios: Record<string, number> = {};

    for (const theme of ["light", "dark"] as const) {
      document.documentElement.dataset.theme = theme;
      const background = token("--color-background");
      ratios[`${theme}-text`] = contrast(token("--color-text"), background);
      ratios[`${theme}-secondary-text`] = contrast(
        token("--color-text-secondary"),
        background,
      );
      ratios[`${theme}-reading-text`] = contrast(
        token("--color-reading-text"),
        background,
      );
      ratios[`${theme}-accent`] = contrast(token("--color-accent"), background);
    }

    return ratios;
  });

  expect(contrastRatios["light-text"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["light-secondary-text"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["light-reading-text"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["dark-text"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["dark-secondary-text"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["dark-reading-text"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["light-accent"]).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatios["dark-accent"]).toBeGreaterThanOrEqual(4.5);
});

test("returns a long research page to its in-page top target", async ({
  page,
}) => {
  await page.goto("./research/from-l3-to-l4-agentic-development/");
  const backToTop = page.getByRole("link", { name: "Back to top" });

  await backToTop.scrollIntoViewIfNeeded();
  await expect(backToTop).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await backToTop.click();
  await expect
    .poll(async () =>
      page.locator("#top").evaluate((target) => {
        const header = document.querySelector("[data-site-header]");
        return Math.abs(
          target.getBoundingClientRect().top -
            (header?.getBoundingClientRect().height ?? 0),
        );
      }),
    )
    .toBeLessThanOrEqual(1);
  await expect(page.locator("#top")).toBeInViewport();
});

test("returns a Work detail page to its in-page top target below the fixed header", async ({
  page,
}) => {
  await page.goto("./work/mac-native-kit/");
  const backToTop = page.getByRole("link", { name: "Back to top" });

  await backToTop.scrollIntoViewIfNeeded();
  await expect(backToTop).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await backToTop.click();
  await expect
    .poll(async () =>
      page.locator("#top").evaluate((target) => {
        const header = document.querySelector("[data-site-header]");
        return Math.abs(
          target.getBoundingClientRect().top -
            (header?.getBoundingClientRect().height ?? 0),
        );
      }),
    )
    .toBeLessThanOrEqual(1);
  await expect(page.locator("#top")).toBeInViewport();
});
