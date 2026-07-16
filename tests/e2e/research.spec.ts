import { expect, test } from "@playwright/test";

const articles = [
  {
    title: "Why Functional Tests Still Fail Real User Journeys",
    slug: "why-functional-tests-fail-user-journeys",
    date: "2026.07.15",
    category: "Human-AI Collaboration",
    status: "Research",
  },
  {
    title: "From L3 to L4 Agentic Software Development",
    slug: "from-l3-to-l4-agentic-development",
    date: "2026.07.14",
    category: "Agentic Development",
    status: "Research",
  },
  {
    title: "Designing a Constraint System for AI-Generated UI",
    slug: "designing-constraint-system-ai-ui",
    date: "2026.07.09",
    category: "AI-Native Interfaces",
    status: "Research",
  },
] as const;

test("renders the Research archive with publication metadata", async ({
  page,
}) => {
  await page.goto("./research/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Research" }),
  ).toBeVisible();
  await expect(page.locator("[data-research-article]")).toHaveCount(
    articles.length,
  );

  for (const article of articles) {
    const item = page.locator("[data-research-article]").filter({
      has: page.getByRole("link", { name: article.title }),
    });
    await expect(item).toContainText(article.date);
    await expect(item).toContainText(article.category);
    await expect(item).toContainText(article.status);
    await expect(item).toContainText(/\d+ min read/u);
    await expect(
      item.getByRole("link", { name: article.title }),
    ).toHaveAttribute("href", `/BashAILabBlog/research/${article.slug}/`);
  }
});

test("keeps themes and nested research routes accessible from the archive", async ({
  page,
}) => {
  await page.goto("./research/");

  await expect(
    page.getByRole("link", { name: "Agentic Development" }),
  ).toHaveAttribute("href", "/BashAILabBlog/research/agentic-development/");

  const response = await page.goto("./research/agentic-development/");
  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", { level: 1, name: "Agentic Development" }),
  ).toBeVisible();
});

test("publishes the Chinese Research archive with reciprocal archive switches", async ({
  page,
}) => {
  await page.goto("./zh/research/");

  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(
    page.getByRole("heading", { level: 1, name: "研究" }),
  ).toBeVisible();
  await expect(page.locator("[data-research-article]")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Switch to English" }).first(),
  ).toHaveAttribute("href", "/BashAILabBlog/research/");

  await page.goto("./research/");
  await expect(
    page.getByRole("link", { name: "切换到中文" }).first(),
  ).toHaveAttribute("href", "/BashAILabBlog/zh/research/");
});

test("renders an article hierarchy, accessible table of contents, and callout", async ({
  page,
}) => {
  await page.goto("./research/from-l3-to-l4-agentic-development/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "From L3 to L4 Agentic Software Development",
    }),
  ).toBeVisible();
  await expect(page.locator("[data-content-prose] h2")).toHaveCount(2);

  const tableOfContents = page.getByRole("navigation", {
    name: "Table of contents",
  });
  await expect(tableOfContents).toBeVisible();
  await expect(
    tableOfContents.getByRole("link", { name: "Working question" }),
  ).toHaveAttribute("href", "#working-question");
  await expect(
    tableOfContents.getByRole("link", { name: "Validation remains explicit" }),
  ).toHaveAttribute("href", "#validation-remains-explicit");
  await expect(page.getByRole("note", { name: "Research note" })).toBeVisible();
});

test("renders a static constraint flow only for its research article", async ({
  page,
}) => {
  await page.goto("./research/agentic-development/");
  await expect(page.locator("[data-constraint-flow]")).toHaveCount(0);

  await page.goto("./research/designing-constraint-system-ai-ui/");
  const flow = page.getByRole("figure", { name: "Constraint-system flow" });
  await expect(flow).toBeVisible();
  await expect(flow).toHaveAttribute("data-constraint-flow", "");
  await expect(flow.getByRole("listitem")).toHaveCount(6);
  await expect(flow).toContainText("Intent");
  await expect(flow).toContainText("Codegen");
  await expect(page.locator("[data-mermaid-diagram]")).toHaveCount(0);
});

test("marks Research current on archive and nested article routes", async ({
  page,
}) => {
  const primaryNavigation = page.getByRole("navigation", { name: "Primary" });
  const researchLink = primaryNavigation.getByRole("link", {
    name: "Research",
  });

  await page.goto("./research/");
  await expect(researchLink).toHaveAttribute("aria-current", "page");

  await page.goto("./research/from-l3-to-l4-agentic-development/");
  await expect(researchLink).toHaveAttribute("aria-current", "page");
});
