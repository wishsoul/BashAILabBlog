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
