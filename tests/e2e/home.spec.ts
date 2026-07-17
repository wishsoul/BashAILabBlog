import { expect, test } from "@playwright/test";

test("renders the content-driven homepage in the approved editorial sequence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Building systems that help",
  );
  await expect(
    page.getByRole("link", { name: "Explore Work" }),
  ).toHaveAttribute("href", "/BashAILabBlog/work/");
  await expect(
    page.getByRole("link", { name: "Read Research" }),
  ).toHaveAttribute("href", "/BashAILabBlog/research/");

  await expect(page.locator("[data-home-section]").first()).toHaveAttribute(
    "data-home-section",
    /hero/,
  );
  expect(
    await page
      .locator("[data-home-section]")
      .evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("data-home-section")),
      ),
  ).toEqual([
    "hero",
    "current-research",
    "selected-work",
    "latest-research",
    "lab-status",
  ]);

  const currentResearch = page.getByRole("region", {
    name: "Current Research",
  });
  await expect(currentResearch.getByRole("listitem")).toHaveCount(3);
  await expect(
    currentResearch.locator("[data-research-theme-title]"),
  ).toHaveText([
    "Agentic Development",
    "AI-Native Interfaces",
    "Independent Products",
  ]);

  const selectedWork = page.getByRole("region", { name: "Selected Work" });
  expect(await selectedWork.locator("[data-project-feature]").count()).toBe(4);
  expect(
    await page.locator("[data-typographic-cover]").count(),
  ).toBeGreaterThanOrEqual(3);
  await expect(selectedWork.locator("[data-project-title]")).toHaveText([
    "MacNativeKit",
    "PastePop",
    "WordGrill",
    "TidyPilot",
  ]);

  const latestResearch = page.getByRole("region", {
    name: "Latest Research",
  });
  await expect(latestResearch.getByRole("listitem")).toHaveCount(3);
  await expect(latestResearch.locator("[data-article-title]")).toHaveText([
    "Why Functional Tests Still Fail Real User Journeys",
    "From L3 to L4 Agentic Software Development",
    "Designing a Constraint System for AI-Generated UI",
  ]);
  await expect(
    latestResearch.getByText(
      "How GitHub Issues Become the Source of Truth for AI Development",
    ),
  ).toHaveCount(0);
  await expect(
    latestResearch.getByText(
      "Human Checkpoints in Autonomous Software Development",
    ),
  ).toHaveCount(0);

  const labStatus = page.getByRole("region", { name: "Lab Status" });
  await expect(labStatus.getByRole("listitem")).toHaveCount(4);
  await expect(labStatus.locator("[data-status-project]")).toHaveText([
    "MacNativeKit",
    "PastePop",
    "WordGrill",
    "TidyPilot",
  ]);
  await expect(labStatus.locator("[data-status-value]")).toHaveText([
    "Active",
    "Building",
    "Testing",
    "Researching",
  ]);

  await expect(page.locator("[data-card-grid]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: /card grid/i })).toHaveCount(0);
});

test("exposes hero entrance groups in editorial order without reduced-motion transforms", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");

  const heroGroups = page.locator(
    '[data-home-section="hero"] [data-hero-motion-group]',
  );
  expect(
    await heroGroups.evaluateAll((groups) =>
      groups.map((group) => group.getAttribute("data-hero-motion-group")),
    ),
  ).toEqual(["heading", "context", "footer"]);
  expect(
    await heroGroups.evaluateAll((groups) =>
      groups.map((group) => getComputedStyle(group).transform),
    ),
  ).toEqual(["none", "none", "none"]);
});

test("keeps every meaningful visible label at the approved readable scale", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");

  const sizes = await page.evaluate(() => {
    const textElements = new Set<HTMLElement>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );

    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.trim();
      const parent = walker.currentNode.parentElement;
      if (!text || !parent) continue;
      if (
        parent.closest(
          "script, style, noscript, [hidden], [aria-hidden='true']",
        )
      )
        continue;
      if (parent.closest(".visually-hidden")) continue;

      const styles = getComputedStyle(parent);
      const rect = parent.getBoundingClientRect();
      if (
        styles.display === "none" ||
        styles.visibility === "hidden" ||
        Number.parseFloat(styles.opacity) === 0 ||
        rect.width === 0 ||
        rect.height === 0
      )
        continue;

      textElements.add(parent);
    }

    return [...textElements].map((element) => ({
      text: element.textContent?.trim().slice(0, 80),
      size: Number.parseFloat(getComputedStyle(element).fontSize),
    }));
  });

  expect(sizes.filter(({ size }) => size < 11.25)).toEqual([]);

  const heroSize = Number.parseFloat(
    await page
      .getByRole("heading", { level: 1 })
      .evaluate((node) => getComputedStyle(node).fontSize),
  );
  expect(heroSize).toBeGreaterThanOrEqual(47.36);
  expect(heroSize).toBeLessThanOrEqual(63.14);
  await expect(page.locator("[data-hero-lead]")).toHaveCSS("font-size", "20px");
  const articleTitleSize = Number.parseFloat(
    await page
      .locator("[data-article-title]")
      .first()
      .evaluate((node) => getComputedStyle(node).fontSize),
  );
  expect(articleTitleSize).toBeCloseTo(26.65, 2);
});

test("preserves the editorial reading order without horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("./");

  expect(
    await page
      .locator("[data-home-section]")
      .evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("data-home-section")),
      ),
  ).toEqual([
    "hero",
    "current-research",
    "selected-work",
    "latest-research",
    "lab-status",
  ]);

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);

  const heroSize = Number.parseFloat(
    await page
      .getByRole("heading", { level: 1 })
      .evaluate((node) => getComputedStyle(node).fontSize),
  );
  expect(heroSize).toBeGreaterThanOrEqual(47.36);
  const renderedHeroText = (
    await page.getByRole("heading", { level: 1 }).innerText()
  ).replace(/\s+/gu, " ");
  expect(renderedHeroText).toContain("help one");
  expect(renderedHeroText).toContain("software with");
});
