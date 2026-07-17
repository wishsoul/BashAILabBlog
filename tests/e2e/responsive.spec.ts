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

test("contains long-form code and tables at the 390px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./zh/work/mac-native-kit/");

  const prose = page.locator("[data-project-case-study]");
  await prose.evaluate((container) => {
    const pre = container.querySelector("pre");
    if (!pre) throw new Error("Expected a MacNativeKit code block");
    const code = pre.querySelector("code") ?? pre;
    code.textContent = "MacNativeKit".repeat(80);

    const table = document.createElement("table");
    table.innerHTML = `
      <thead><tr>${Array.from({ length: 8 }, (_, index) => `<th>Column ${index + 1}</th>`).join("")}</tr></thead>
      <tbody><tr>${Array.from({ length: 8 }, (_, index) => `<td>Value ${index + 1}</td>`).join("")}</tr></tbody>
    `;
    container.append(table);
  });

  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const pre = document.querySelector<HTMLElement>(
      "[data-project-case-study] pre",
    );
    const table = document.querySelector<HTMLElement>(
      "[data-project-case-study] table",
    );
    const rail = document.querySelector<HTMLElement>(".project-layout__rail");
    if (!pre || !table || !rail)
      throw new Error("Responsive fixtures are incomplete");
    return {
      codeClientWidth: pre.clientWidth,
      codeOverflow: getComputedStyle(pre).overflowX,
      codeScrollWidth: pre.scrollWidth,
      codeWhiteSpace: getComputedStyle(pre).whiteSpace,
      documentClientWidth: root.clientWidth,
      documentScrollWidth: root.scrollWidth,
      railPosition: getComputedStyle(rail).position,
      tableClientWidth: table.clientWidth,
      tableOverflow: getComputedStyle(table).overflowX,
      tableScrollWidth: table.scrollWidth,
    };
  });

  expect(metrics.documentScrollWidth).toBe(metrics.documentClientWidth);
  expect(metrics.railPosition).toBe("static");
  expect(metrics.codeOverflow).toBe("auto");
  expect(metrics.codeWhiteSpace).toBe("pre");
  expect(metrics.codeScrollWidth).toBeGreaterThan(metrics.codeClientWidth);
  expect(metrics.tableOverflow).toBe("auto");
  expect(metrics.tableScrollWidth).toBeGreaterThan(metrics.tableClientWidth);
});

test("keeps the contents rail sticky only when the reading column fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("./work/mac-native-kit/");
  await expect(page.locator(".project-layout__rail")).toHaveCSS(
    "position",
    "sticky",
  );

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator(".project-layout__rail")).toHaveCSS(
    "position",
    "static",
  );
});
