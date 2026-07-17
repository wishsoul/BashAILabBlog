import { expect, test } from "@playwright/test";

test("renders Chinese shared UI labels and home SEO", async ({ page }) => {
  await page.goto("./zh/");

  await expect(page).toHaveTitle("Bash AI 实验室 — AI 产品研究与独立软件");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Bash AI 实验室的 AI 产品研究、智能体开发系统与独立软件实践。",
  );
  await expect(
    page.getByRole("link", { name: "跳至主要内容" }),
  ).toHaveAttribute("href", "#main-content");
  await expect(page.locator(".lab-status__scope").first()).toHaveText(
    "基础设施 / macOS",
  );
  await expect(page.locator(".lab-status [data-status-value]")).toHaveText([
    "进行中",
    "构建中",
    "测试中",
    "研究中",
  ]);

  await page.goto("./zh/log/");
  await expect(page.locator(".log-timeline__meta")).toHaveText([
    "研究笔记",
    "决策",
    "决策",
  ]);

  await page.goto("./zh/research/from-l3-to-l4-agentic-development/");
  const tableOfContents = page.getByRole("navigation", { name: "目录" });
  await expect(tableOfContents).toBeVisible();
  await expect(
    tableOfContents.getByText("本页目录", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "面包屑" })).toBeVisible();
  await expect(page.getByRole("link", { name: "返回顶部" })).toHaveCount(1);
});

test("keeps WordGrill platform metadata canonical while rendering it in Chinese", async ({
  page,
}) => {
  await page.goto("./zh/work/wordgrill/");

  await expect(page.locator("[data-project-metadata]")).toContainText(
    "iOS 和 macOS",
  );
  await expect(page.locator(".project-layout__rail")).toContainText("本页目录");

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((script) => JSON.parse(script.textContent ?? "[]"));
  const work = jsonLd.find(
    (entry: { "@type"?: string }) => entry["@type"] === "SoftwareApplication",
  );

  expect(work.operatingSystem).toBe("iOS and macOS");
});
