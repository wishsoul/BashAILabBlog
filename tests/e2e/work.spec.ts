import { expect, test } from "@playwright/test";

const projects = [
  {
    title: "MacNativeKit",
    slug: "mac-native-kit",
    category: "Infrastructure",
  },
  { title: "PastePop", slug: "pastepop", category: "Products" },
  { title: "WordGrill", slug: "wordgrill", category: "Products" },
  { title: "TidyPilot", slug: "tidypilot", category: "Products" },
] as const;

test("renders the complete Work archive as an editorial project list", async ({
  page,
}) => {
  await page.goto("./work/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Work" }),
  ).toBeVisible();
  await expect(page.locator("[data-project-list-item]")).toHaveCount(4);
  await expect(page.locator("[data-project-list-title]")).toHaveText(
    projects.map(({ title }) => title),
  );
  await expect(page.locator("[data-card-grid]")).toHaveCount(0);

  for (const project of projects) {
    await expect(
      page.getByRole("link", { name: `View ${project.title}` }),
    ).toHaveAttribute("href", `/BashAILabBlog/work/${project.slug}/`);
  }
});

test("filters Work by category and persists the selected filter in the URL", async ({
  page,
}) => {
  await page.goto("./work/");

  const all = page.getByRole("button", { name: "All" });
  const products = page.getByRole("button", { name: "Products" });
  const infrastructure = page.getByRole("button", {
    name: "Infrastructure",
  });

  await expect(all).toHaveAttribute("aria-pressed", "true");
  await products.click();

  await expect(products).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(/\?category=Products$/u);
  await expect(page.locator('[data-project-category="Products"]')).toHaveCount(
    3,
  );
  await expect(
    page.locator('[data-project-category="Products"]:visible'),
  ).toHaveCount(3);
  await expect(
    page.locator('[data-project-category="Infrastructure"]'),
  ).toBeHidden();

  await page.reload();
  await expect(products).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-project-category="Infrastructure"]'),
  ).toBeHidden();

  await infrastructure.click();
  await expect(infrastructure).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-project-category="Infrastructure"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-project-category="Products"]:visible'),
  ).toHaveCount(0);

  await all.click();
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(page).not.toHaveURL(/category=/u);
  await expect(page.locator("[data-project-list-item]:visible")).toHaveCount(4);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("keeps every project and route accessible", async ({ page }) => {
    await page.goto("./work/?category=Products");

    await expect(page.locator("[data-project-list-item]")).toHaveCount(4);
    await expect(page.locator("[data-project-list-item]:visible")).toHaveCount(
      4,
    );

    for (const project of projects) {
      await expect(
        page.getByRole("link", { name: `View ${project.title}` }),
      ).toHaveAttribute("href", `/BashAILabBlog/work/${project.slug}/`);
    }
  });
});

test("builds all four project routes and renders the approved case-study sequence", async ({
  page,
}) => {
  for (const project of projects) {
    const response = await page.goto(`./work/${project.slug}/`);
    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole("heading", { level: 1, name: project.title }),
    ).toBeVisible();
  }

  await page.goto("./work/mac-native-kit/");

  const metadata = page.locator("[data-project-metadata]");
  await expect(metadata).toContainText("Infrastructure");
  await expect(metadata).toContainText("Active");
  await expect(metadata).toContainText("macOS");
  await expect(metadata).toContainText(
    "Product strategy, system design, and implementation",
  );
  await expect(metadata.getByText("Year", { exact: true })).toBeVisible();
  await expect(metadata.getByText("2026", { exact: true })).toBeVisible();
  await expect(metadata.getByText("Started", { exact: true })).toBeVisible();
  await expect(metadata.getByText("June 2026", { exact: true })).toBeVisible();
  await expect(page.locator("[data-project-actions]")).toHaveCount(0);

  await expect(page.locator("[data-project-case-study] h2")).toHaveText([
    "Problem",
    "Insight",
    "Product Strategy",
    "Solution",
    "AI / Technical Approach",
    "My Role",
    "Artifacts",
    "Results",
    "Learnings",
    "Next Step",
  ]);
});

test("switches the published paired Work detail between languages", async ({
  page,
}) => {
  await page.goto("./work/mac-native-kit/");

  await expect(
    page.getByRole("link", { name: "切换到中文" }).first(),
  ).toHaveAttribute("href", "/BashAILabBlog/zh/work/mac-native-kit/");
});

test("marks Work current on both the archive and nested project routes", async ({
  page,
}) => {
  const primaryNavigation = page.getByRole("navigation", { name: "Primary" });
  const workLink = primaryNavigation.getByRole("link", { name: "Work" });

  await page.goto("./work/");
  await expect(workLink).toHaveAttribute("aria-current", "page");

  await page.goto("./work/mac-native-kit/");
  await expect(workLink).toHaveAttribute("aria-current", "page");
});

test("preserves project source order and avoids overflow on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("./work/");

  await expect(page.locator("[data-project-list-title]")).toHaveText(
    projects.map(({ title }) => title),
  );
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("uses one readable type scale for Chinese Work prose", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./zh/work/mac-native-kit/");

  const prose = page.locator("[data-project-case-study]");
  await expect(prose).toHaveClass(/\bprose\b/u);

  const metrics = await prose.evaluate((container) => {
    const paragraph = container.querySelector("h2 + p");
    const nextParagraph = container.querySelector("p + p");
    const listItem = container.querySelector("ul > li");
    const heading = container.querySelector("h2");
    if (!paragraph || !nextParagraph || !listItem || !heading)
      throw new Error("MacNativeKit prose fixtures are incomplete");

    const paragraphStyles = getComputedStyle(paragraph);
    const nextParagraphRect = nextParagraph.getBoundingClientRect();
    const previousParagraph = nextParagraph.previousElementSibling;
    if (!(previousParagraph instanceof HTMLParagraphElement))
      throw new Error("Expected adjacent paragraphs");
    const previousParagraphRect = previousParagraph.getBoundingClientRect();
    const listStyles = getComputedStyle(listItem);
    const headingStyles = getComputedStyle(heading);

    return {
      gap: nextParagraphRect.top - previousParagraphRect.bottom,
      headingFontSize: Number.parseFloat(headingStyles.fontSize),
      headingFontWeight: Number.parseFloat(headingStyles.fontWeight),
      listColor: listStyles.color,
      listFontSize: listStyles.fontSize,
      listLineHeight: listStyles.lineHeight,
      paragraphColor: paragraphStyles.color,
      paragraphFontSize: Number.parseFloat(paragraphStyles.fontSize),
      paragraphLineHeight: paragraphStyles.lineHeight,
      proseColor: getComputedStyle(container).color,
      proseWidth: container.getBoundingClientRect().width,
      readingColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--color-reading-text")
        .trim(),
    };
  });

  expect(metrics.proseWidth).toBeGreaterThanOrEqual(630);
  expect(metrics.proseWidth).toBeLessThanOrEqual(650);
  expect(metrics.paragraphFontSize).toBeGreaterThanOrEqual(18);
  expect(metrics.paragraphFontSize).toBeLessThanOrEqual(20);
  expect(metrics.listFontSize).toBe(`${metrics.paragraphFontSize}px`);
  expect(metrics.listLineHeight).toBe(metrics.paragraphLineHeight);
  expect(metrics.listColor).toBe(metrics.paragraphColor);
  expect(metrics.paragraphColor).toBe(metrics.proseColor);
  expect(metrics.readingColor).not.toBe("");
  expect(metrics.gap).toBeGreaterThanOrEqual(24);
  expect(metrics.gap).toBeLessThanOrEqual(30);
  expect(metrics.headingFontSize).toBeGreaterThanOrEqual(30);
  expect(metrics.headingFontWeight).toBeGreaterThanOrEqual(600);
});

test("renders dark Work prose with the reading token and a distinct code surface", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.removeItem("theme"));
  await page.goto("./zh/work/mac-native-kit/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const colors = await page.evaluate(() => {
    const prose = document.querySelector<HTMLElement>(
      "[data-project-case-study]",
    );
    const paragraph = prose?.querySelector("p");
    const codeBlock = prose?.querySelector("pre");
    if (!prose || !paragraph || !codeBlock)
      throw new Error("Dark Work prose fixtures are incomplete");
    return {
      background: getComputedStyle(document.body).backgroundColor,
      codeBackground: getComputedStyle(codeBlock).backgroundColor,
      paragraph: getComputedStyle(paragraph).color,
      prose: getComputedStyle(prose).color,
    };
  });

  expect(colors.paragraph).toBe(colors.prose);
  expect(colors.codeBackground).not.toBe(colors.background);
});

test("generates an indexed English Work table of contents from Markdown headings", async ({
  page,
}) => {
  await page.goto("./work/mac-native-kit/");

  const contents = page.getByRole("navigation", {
    name: "Table of contents",
  });
  await expect(contents).toBeVisible();
  await expect(
    contents.getByText("On this page", { exact: true }),
  ).toBeVisible();

  const links = contents.getByRole("link");
  await expect(links).toHaveCount(10);
  await expect(links).toHaveText([
    "Problem",
    "Insight",
    "Product Strategy",
    "Solution",
    "AI / Technical Approach",
    "My Role",
    "Artifacts",
    "Results",
    "Learnings",
    "Next Step",
  ]);

  const hrefs = await links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href")),
  );
  expect(
    await page.evaluate(
      (targets) =>
        targets.every(
          (target) =>
            target?.startsWith("#") && document.getElementById(target.slice(1)),
        ),
      hrefs,
    ),
  ).toBe(true);

  const indexes = await contents
    .locator(".table-of-contents__index")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()));
  expect(indexes).toEqual([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
  ]);
});

test("localizes the Chinese Work table of contents", async ({ page }) => {
  await page.goto("./zh/work/mac-native-kit/");

  const contents = page.getByRole("navigation", { name: "目录" });
  await expect(contents).toBeVisible();
  await expect(contents.getByText("本页目录", { exact: true })).toBeVisible();
  await expect(contents.getByRole("link")).toHaveCount(10);
  await expect(contents.getByRole("link", { name: "问题" })).toHaveAttribute(
    "href",
    "#问题",
  );
});

test("reduces the no-cover project specimen without changing its design", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./work/mac-native-kit/");

  const specimen = page.locator(".project-hero-specimen");
  await expect(specimen).toBeVisible();
  const height = await specimen.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(height).toBeGreaterThanOrEqual(320);
  expect(height).toBeLessThanOrEqual(481);
  await expect(specimen).toContainText("01");
  await expect(specimen).toContainText("MacNativeKit");
});
