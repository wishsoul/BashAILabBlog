import { expect, test } from "@playwright/test";

test("renders the Log chronologically with semantic dates", async ({
  page,
}) => {
  await page.goto("./log/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Log" }),
  ).toBeVisible();
  await expect(page.locator("[data-log-entry]")).toHaveCount(3);
  await expect(page.locator("[data-log-date]").first()).toHaveAttribute(
    "datetime",
    "2026-07-15",
  );
  expect(
    await page
      .locator("[data-log-date]")
      .evaluateAll((dates) =>
        dates.map((date) => date.getAttribute("datetime")),
      ),
  ).toEqual(["2026-07-15", "2026-07-14", "2026-07-09"]);
});

test("renders all six supplied About sections", async ({ page }) => {
  await page.goto("./about/");

  await expect(
    page.getByRole("heading", { level: 1, name: "About" }),
  ).toBeVisible();
  await expect(page.locator("[data-page-content] h2")).toHaveText([
    "01 Background",
    "02 Current Focus",
    "03 How I Work",
    "04 Principles",
    "05 Selected Experience",
    "06 Contact",
  ]);
});

test("renders the supplied Resume without unsupported employment or credential sections", async ({
  page,
}) => {
  await page.goto("./resume/");

  const resume = page.locator("[data-page-content]");
  await expect(
    page.getByRole("heading", { level: 1, name: "Resume" }),
  ).toBeVisible();
  await expect(
    resume.getByRole("heading", { name: "Project Roles" }),
  ).toBeVisible();
  await expect(
    resume.getByText(
      "This page does not publish employers, employment dates, credentials, project metrics, testimonials, or launch outcomes because those details were not supplied in the approved source material.",
    ),
  ).toBeVisible();
  await expect(resume.getByRole("heading", { name: "Employment" })).toHaveCount(
    0,
  );
  await expect(resume.getByRole("heading", { name: "Education" })).toHaveCount(
    0,
  );
});

test("renders the Chinese preparation status without translated content", async ({
  page,
}) => {
  await page.goto("./zh/");

  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(
    page.getByRole("heading", { name: "中文版正在准备中。" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "经过审核的中文内容将在准备完成后发布。你现在仍可访问完整的英文版。",
    ),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "访问英文版" })).toHaveAttribute(
    "href",
    "/BashAILabBlog/",
  );
});

test("renders a base-safe home link on the 404 page", async ({ page }) => {
  await page.goto("./404.html");

  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back home" })).toHaveAttribute(
    "href",
    "/BashAILabBlog/",
  );
});
