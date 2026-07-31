# Long-form Typography System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one localized, accessible long-form typography and contents system shared by Work and Research, with a 40rem reading column, controlled wide media, and no page-level overflow.

**Architecture:** A new global `src/styles/prose.css` owns Markdown presentation, while `ProjectLayout.astro` and `ContentLayout.astro` retain only page composition. Astro-generated headings flow through both Work and Research routes into the shared `TableOfContents.astro`; no client-side table-of-contents script is added.

**Tech Stack:** Astro 7, MDX, TypeScript, CSS custom properties, Playwright, Vitest, GitHub Pages base-path build.

## Global Constraints

- Do not redesign the blog or copy OpenAI branding, fonts, or components.
- Do not modify article copy or content schemas.
- Do not add a framework, dependency, downloaded font, or client-side script.
- Preserve light and dark themes, responsive behavior, focus-visible styling, and `prefers-reduced-motion`.
- Preserve Astro, MDX, GitHub Pages base-path behavior, and all English and Chinese routes.
- Use the existing Geist fonts for English and code; use the approved system CJK stack for Chinese.
- Keep unrelated untracked files (`.agents/`, `skills-lock.json`, and `docs/superpowers/plans/2026-07-16-bilingual-chinese-edition.md`) untouched.
- Do not commit, push, create a branch, or create a pull request. The user explicitly requested no automatic commit or push.
- Follow red-green-refactor: add each behavioral test first, run it and confirm the expected failure, then make the minimum production change.

---

## Task 1: Establish the Shared Prose Contract

**Files:**

- Create: `src/styles/prose.css`
- Modify: `src/styles/global.css:1-43, 109-127`
- Modify: `src/layouts/ProjectLayout.astro:121-306`
- Modify: `src/layouts/ContentLayout.astro:102-222`
- Modify: `tests/e2e/work.spec.ts:83-139`
- Modify: `tests/e2e/research.spec.ts:80-110`
- Modify: `tests/e2e/accessibility.spec.ts:48-99`

**Interfaces:**

- Produces: a global `.prose` class and the CSS tokens `--color-reading-text`, `--font-cjk`, `--font-size-reading`, `--reading-width`, and `--reading-wide-width`.
- Preserves: `[data-project-case-study]` and `[data-content-prose]` as stable browser-test hooks.
- Consumes: existing `--color-background`, `--color-surface`, `--color-text`, `--color-text-secondary`, `--color-border`, `--color-accent`, `--font-mono`, `--page-gutter`, and `--site-header-height` tokens.

- [ ] **Step 1: Add a failing Work typography behavior test**

Append this test to `tests/e2e/work.spec.ts`:

```ts
test("uses one readable type scale for Chinese Work prose", async ({ page }) => {
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
```

- [ ] **Step 2: Add a failing dark-theme Work prose test**

Append this test to `tests/e2e/work.spec.ts`:

```ts
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
```

- [ ] **Step 3: Add a failing Research reuse test**

Add this test to `tests/e2e/research.spec.ts`:

```ts
test("reuses the shared prose system without flattening MDX callouts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./research/from-l3-to-l4-agentic-development/");

  const prose = page.locator("[data-content-prose]");
  await expect(prose).toHaveClass(/\bprose\b/u);

  const callout = page.getByRole("note", { name: "Research note" });
  const widths = await page.evaluate(() => {
    const proseElement = document.querySelector<HTMLElement>(
      "[data-content-prose]",
    );
    const calloutElement = document.querySelector<HTMLElement>("[role='note']");
    if (!proseElement || !calloutElement)
      throw new Error("Research prose fixtures are incomplete");
    return {
      callout: calloutElement.getBoundingClientRect().width,
      prose: proseElement.getBoundingClientRect().width,
    };
  });

  await expect(callout).toBeVisible();
  expect(widths.callout).toBeLessThanOrEqual(widths.prose);
});
```

- [ ] **Step 4: Extend the contrast test with the reading token**

Inside the existing theme loop in `tests/e2e/accessibility.spec.ts`, add:

```ts
ratios[`${theme}-reading-text`] = contrast(
  token("--color-reading-text"),
  background,
);
```

After the existing secondary-text assertions, add:

```ts
expect(contrastRatios["light-reading-text"]).toBeGreaterThanOrEqual(4.5);
expect(contrastRatios["dark-reading-text"]).toBeGreaterThanOrEqual(4.5);
```

- [ ] **Step 5: Run the narrow tests and verify RED**

Run:

```bash
npm run test:e2e -- tests/e2e/work.spec.ts tests/e2e/research.spec.ts tests/e2e/accessibility.spec.ts --grep "readable type scale|dark Work prose|shared prose system|contrast-critical"
```

Expected: FAIL because the containers do not have `.prose`, `--color-reading-text` is absent, the prose width is 36rem, adjacent Work paragraphs have a zero gap, and Work list items remain at the 15px body scale.

- [ ] **Step 6: Add shared reading tokens and Chinese inheritance**

Update the beginning of `src/styles/global.css` to import the new stylesheet and define the approved tokens:

```css
@import "tailwindcss";
@import "./prose.css";

:root {
  color-scheme: light;
  --color-background: #f5f5f1;
  --color-surface: #ffffff;
  --color-text: #111111;
  --color-text-secondary: #686868;
  --color-reading-text: #282826;
  --color-border: rgb(0 0 0 / 10%);
  --color-accent: #5b5cff;
  --font-sans: "Geist Variable", system-ui, sans-serif;
  --font-cjk:
    "PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", ui-monospace, monospace;
  --font-size-3xs: 0.395625rem;
  --font-size-2xs: 0.5275rem;
  --font-size-xs: 0.703125rem;
  --font-size-sm: 0.9375rem;
  --font-size-md: 1.25rem;
  --font-size-lg: 1.665625rem;
  --font-size-xl: 2.220625rem;
  --font-size-2xl: 2.96rem;
  --font-size-3xl: 3.945625rem;
  --font-size-reading: clamp(1.125rem, 1.08rem + 0.18vw, 1.25rem);
  --page-gutter: clamp(1rem, 4vw, 4rem);
  --page-width: 82rem;
  --reading-width: 40rem;
  --reading-wide-width: 52rem;
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-background: #0b0b0c;
  --color-surface: #121214;
  --color-text: #f1f1ee;
  --color-text-secondary: #99999f;
  --color-reading-text: #d8d8d4;
  --color-border: rgb(255 255 255 / 12%);
  --color-accent: #8d8eff;
}
```

Add these language-specific rules after the `body` rule:

```css
html:lang(zh) body {
  font-family: var(--font-cjk);
}

html:lang(zh) .meta-label {
  font-family: var(--font-cjk);
  letter-spacing: 0.04em;
  text-transform: none;
}
```

- [ ] **Step 7: Create the initial shared prose stylesheet**

Create `src/styles/prose.css` with this complete initial content:

```css
.prose {
  display: grid;
  width: min(100%, var(--reading-width));
  grid-template-columns: minmax(0, 1fr);
  color: var(--color-reading-text);
  font-size: var(--font-size-reading);
  line-height: 1.75;
}

html:lang(zh) .prose {
  line-height: 1.8;
}

.prose > :where(*) {
  min-width: 0;
}

.prose > :where(h2, h3, h4) {
  color: var(--color-text);
  scroll-margin-top: calc(var(--site-header-height) + 1.5rem);
  text-wrap: balance;
}

.prose > :where(h2) {
  margin: clamp(3.5rem, 7vw, 5rem) 0 1.25rem;
  font-size: clamp(1.875rem, 1.65rem + 0.7vw, 2.25rem);
  font-weight: 620;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.prose > :where(h2:first-child) {
  margin-block-start: 0;
}

.prose > :where(h3) {
  margin: 2.75rem 0 1rem;
  font-size: clamp(1.4rem, 1.3rem + 0.35vw, 1.65rem);
  font-weight: 600;
  line-height: 1.3;
}

.prose > :where(h4) {
  margin: 2rem 0 0.75rem;
  font-size: clamp(1.125rem, 1.05rem + 0.25vw, 1.35rem);
  font-weight: 620;
  line-height: 1.4;
}

.prose :where(p) {
  margin: 0;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

.prose > :where(p + p),
.prose :where(blockquote:not([class]) p + p) {
  margin-block-start: 1.4em;
}

.prose :where(ul:not([class]), ol:not([class])) {
  padding-inline-start: 1.35em;
  margin-block: 1.4em 1.8em;
}

.prose
  :where(ul:not([class]), ol:not([class]))
  :where(ul:not([class]), ol:not([class])) {
  margin-block: 0.65em;
}

.prose :where(ul:not([class]), ol:not([class])) > li {
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

.prose :where(ul:not([class]), ol:not([class])) > li + li {
  margin-block-start: 0.5em;
}

.prose :where(a) {
  color: inherit;
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

.prose :where(strong) {
  color: var(--color-text);
  font-weight: 650;
}

.prose :where(em) {
  font-style: italic;
}

.prose :where(blockquote:not([class])) {
  padding-inline-start: 1.25rem;
  margin: 2rem 0;
  border-inline-start: 0.2rem solid var(--color-accent);
  color: var(--color-reading-text);
}

.prose :where(code) {
  padding: 0.08em 0.3em;
  border: 1px solid var(--color-border);
  border-radius: 0.2rem;
  background: var(--color-surface);
  font-family: var(--font-mono);
  font-size: 0.88em;
}

.prose > :where(pre) {
  width: 100%;
  padding: 1.25rem;
  margin-block: 2rem;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 0.35rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem);
  line-height: 1.6;
  tab-size: 2;
  white-space: pre;
}

.prose > :where(pre) :where(code) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.prose > :where(table) {
  display: block;
  width: 100%;
  margin-block: 2rem;
  overflow-x: auto;
  border-collapse: collapse;
  color: var(--color-reading-text);
  font-size: 0.9em;
  line-height: 1.5;
  text-align: start;
}

.prose :where(thead, tbody) {
  border: 0;
}

.prose :where(th, td) {
  padding: 0.7rem 0.85rem;
  border-block-end: 1px solid var(--color-border);
  text-align: start;
  vertical-align: top;
}

.prose :where(th) {
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 620;
}

.prose > :where(hr) {
  width: 100%;
  height: 1px;
  margin-block: 3rem;
  border: 0;
  background: var(--color-border);
}

.prose > :where(img, video),
.prose :where(figure img, figure video) {
  display: block;
  width: 100%;
  height: auto;
}

.prose > :where(img, video, figure) {
  margin-block: 2rem;
}

.prose :where(figcaption) {
  margin-block-start: 0.75rem;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: 0.75em;
  line-height: 1.5;
}
```

- [ ] **Step 8: Apply `.prose` and remove duplicate Markdown styles**

In `ProjectLayout.astro`, change the content container to:

```astro
<div class="project-case-study prose" data-project-case-study>
  <slot />
</div>
```

Delete the `.project-case-study` width rule and every `.project-case-study :global(...)` Markdown rule. Retain project body, rail, hero, metadata, footer, and breakpoint styles.

In `ContentLayout.astro`, change the content container to:

```astro
<div class="content-layout__prose prose" data-content-prose>
  <slot />
</div>
```

Delete the `.content-layout__prose` width rule and every `.content-layout__prose > :global(...)` Markdown rule. Retain content body, rail, header, metadata, footer, and breakpoint styles.

After each layout’s base H1 rule, add its Chinese-page override:

```css
:global(html:lang(zh)) .project-layout h1 {
  letter-spacing: -0.035em;
}
```

and:

```css
:global(html:lang(zh)) .content-layout h1 {
  letter-spacing: -0.035em;
}
```

- [ ] **Step 9: Run the narrow tests and verify GREEN**

Run the same command from Step 5.

Expected: PASS. The Work and Research containers share `.prose`, the Work prose is approximately 640px wide, paragraph/list metrics match, paragraph spacing is 24–30px, H2 is at least 30px/600, callout width remains contained, and both reading tokens pass AA contrast.

- [ ] **Step 10: Review the task diff without committing**

Run:

```bash
git diff --check
git diff -- src/styles/global.css src/styles/prose.css src/layouts/ProjectLayout.astro src/layouts/ContentLayout.astro tests/e2e/work.spec.ts tests/e2e/research.spec.ts tests/e2e/accessibility.spec.ts
```

Expected: no whitespace errors; only the shared prose contract and its behavior tests appear.

---

## Task 2: Generate a Localized Work Table of Contents

**Files:**

- Modify: `src/pages/work/[...slug].astro:25-34`
- Modify: `src/pages/zh/work/[...slug].astro:25-34`
- Modify: `src/layouts/ProjectLayout.astro:1-28, 116-126, 273-286`
- Modify: `src/layouts/ContentLayout.astro:24-31, 97-105, 146-168`
- Modify: `src/components/content/TableOfContents.astro:1-78`
- Modify: `src/i18n/zh.ts:29-35`
- Modify: `tests/e2e/work.spec.ts:83-152`
- Modify: `tests/e2e/research.spec.ts:80-110`

**Interfaces:**

- Consumes: Astro’s `headings` array from `render(entry)` with `{ depth, slug, text }` entries.
- Produces: `ProjectLayout` prop `headings: Heading[]`, localized H2/H3 navigation, and two-digit H2 indexes.
- Preserves: the existing `TableOfContents` `aria-label`, same-document fragment links, and Research contents behavior.

- [ ] **Step 1: Add failing localized Work contents tests**

Append these tests to `tests/e2e/work.spec.ts`:

```ts
test("generates an indexed English Work table of contents from Markdown headings", async ({
  page,
}) => {
  await page.goto("./work/mac-native-kit/");

  const contents = page.getByRole("navigation", {
    name: "Table of contents",
  });
  await expect(contents).toBeVisible();
  await expect(contents.getByText("On this page", { exact: true })).toBeVisible();

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
```

Extend the existing Research contents test with:

```ts
await expect(page.locator("[data-content-prose]")).toHaveClass(/\bprose\b/u);
await expect(
  tableOfContents.getByText("On this page", { exact: true }),
).toBeVisible();
```

- [ ] **Step 2: Run the localized contents tests and verify RED**

Run:

```bash
npm run test:e2e -- tests/e2e/work.spec.ts tests/e2e/research.spec.ts --grep "table of contents|article hierarchy"
```

Expected: Work tests FAIL because `ProjectLayout` still renders the static case-study rail and Work routes do not pass headings. The existing Research behavior remains green.

- [ ] **Step 3: Pass generated headings through both Work routes**

In both Work detail route files, replace:

```ts
const { Content } = await render(entry);
```

with:

```ts
const { Content, headings } = await render(entry);
```

Pass the headings to the layout:

```astro
<ProjectLayout
  entry={entry}
  headings={headings}
  translationPath={counterpartPath}
>
  <Content />
</ProjectLayout>
```

- [ ] **Step 4: Replace the Project rail with generated navigation**

Import `TableOfContents` in `ProjectLayout.astro` and add the heading interface and prop:

```ts
import TableOfContents from "../components/content/TableOfContents.astro";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  entry: CollectionEntry<"work">;
  headings: Heading[];
  translationPath?: string;
}

const { entry, headings, translationPath } = Astro.props;
const tableOfContentsHeadings = headings.filter(
  (heading) => heading.depth >= 2 && heading.depth <= 3,
);
const hasTableOfContents = tableOfContentsHeadings.length > 0;
```

Replace the body opening and old `aria-hidden` rail with:

```astro
<div
  class:list={[
    "project-layout__body",
    {
      "project-layout__body--without-rail": !hasTableOfContents,
    },
  ]}
>
  {
    hasTableOfContents && (
      <aside class="project-layout__rail">
        <TableOfContents headings={tableOfContentsHeadings} locale={locale} />
      </aside>
    )
  }
```

Delete the old project number and case-study label spans. Replace the old rail typography rules with only its layout behavior:

```css
.project-layout__rail {
  position: sticky;
  top: calc(var(--site-header-height) + 2rem);
}

.project-layout__body--without-rail {
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
}
```

- [ ] **Step 5: Give ContentLayout the same empty-rail behavior**

After destructuring props in `ContentLayout.astro`, add:

```ts
const tableOfContentsHeadings = headings.filter(
  (heading) => heading.depth >= 2 && heading.depth <= 3,
);
const hasTableOfContents = tableOfContentsHeadings.length > 0;
```

Replace the body opening and rail with:

```astro
<div
  class:list={[
    "content-layout__body",
    {
      "content-layout__body--without-rail": !hasTableOfContents,
    },
  ]}
>
  {
    hasTableOfContents && (
      <aside class="content-layout__rail">
        <TableOfContents headings={tableOfContentsHeadings} locale={locale} />
      </aside>
    )
  }
```

Add:

```css
.content-layout__body--without-rail {
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
}
```

- [ ] **Step 6: Render H2 indexes and restrained H3 entries**

In `TableOfContents.astro`, replace the `items` declaration with:

```ts
let sectionIndex = 0;
const items = headings
  .filter((heading) => heading.depth >= 2 && heading.depth <= 3)
  .map((heading) => ({
    ...heading,
    index:
      heading.depth === 2
        ? String(++sectionIndex).padStart(2, "0")
        : undefined,
  }));
```

Replace each list item body with:

```astro
<li class:list={{ "table-of-contents__subitem": heading.depth === 3 }}>
  <span class="table-of-contents__index" aria-hidden="true">
    {heading.index ?? ""}
  </span>
  <a href={`#${heading.slug}`}>{heading.text}</a>
</li>
```

Replace the component styles with:

```css
.table-of-contents {
  padding-inline-start: 1rem;
  border-inline-start: 1px solid var(--color-border);
}

.table-of-contents > p {
  margin: 0 0 0.85rem;
}

.table-of-contents ol {
  display: grid;
  gap: 0.6rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.table-of-contents li {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.5rem;
  align-items: baseline;
}

.table-of-contents__index {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}

.table-of-contents a {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.45;
  text-decoration: none;
}

.table-of-contents a:hover,
.table-of-contents a:focus-visible {
  color: var(--color-text);
  text-decoration: underline;
}

.table-of-contents__subitem {
  padding-inline-start: 0.75rem;
}

.table-of-contents__subitem .table-of-contents__index::before {
  content: "—";
}
```

- [ ] **Step 7: Localize the visible Chinese title**

In `src/i18n/zh.ts`, change:

```ts
onThisPage: "本页内容",
```

to:

```ts
onThisPage: "本页目录",
```

- [ ] **Step 8: Run the localized contents tests and verify GREEN**

Run the command from Step 2.

Expected: PASS. Work exposes 10 generated H2 links with matching targets and indexes; Chinese and English visible labels are correct; Research retains its existing contents behavior.

- [ ] **Step 9: Verify Astro types and review the task diff**

Run:

```bash
npm run check
git diff --check
git diff -- 'src/pages/work/[...slug].astro' 'src/pages/zh/work/[...slug].astro' src/layouts/ProjectLayout.astro src/layouts/ContentLayout.astro src/components/content/TableOfContents.astro src/i18n/zh.ts tests/e2e/work.spec.ts tests/e2e/research.spec.ts
```

Expected: Astro check exits 0; the diff contains static heading data flow and localized navigation only. Do not commit.

---

## Task 3: Add Wide Technical Media, Responsive Rail Behavior, and the Shorter Specimen Hero

**Files:**

- Modify: `src/styles/prose.css`
- Modify: `src/layouts/ProjectLayout.astro:132-145, 281-370`
- Modify: `src/layouts/ContentLayout.astro:140-247`
- Modify: `src/components/mdx/ConstraintFlow.astro:9-12`
- Modify: `tests/e2e/work.spec.ts`
- Modify: `tests/e2e/research.spec.ts`
- Modify: `tests/e2e/responsive.spec.ts:1-70`

**Interfaces:**

- Consumes: `--reading-width`, `--reading-wide-width`, and `--page-gutter` from Task 1.
- Produces: `.prose-wide` as the explicit wide-media opt-in and responsive rail behavior at `64rem`.
- Preserves: raw images at reading width, internal code/table scrolling, and component-owned QuoteBlock width.

- [ ] **Step 1: Add failing wide-content and hero tests**

Append to `tests/e2e/research.spec.ts`:

```ts
test("lets architecture figures exceed the reading column without widening quotes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./research/designing-constraint-system-ai-ui/");

  const widths = await page.evaluate(() => {
    const prose = document.querySelector<HTMLElement>("[data-content-prose]");
    const flow = document.querySelector<HTMLElement>("[data-constraint-flow]");
    if (!prose || !flow) throw new Error("Wide-content fixtures are incomplete");
    return {
      flow: flow.getBoundingClientRect().width,
      prose: prose.getBoundingClientRect().width,
    };
  });

  expect(widths.flow).toBeGreaterThan(widths.prose);
  expect(widths.flow).toBeLessThanOrEqual(832);
});
```

Append to `tests/e2e/work.spec.ts`:

```ts
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
```

- [ ] **Step 2: Add a failing 390px internal-scroll test**

Append to `tests/e2e/responsive.spec.ts`:

```ts
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
```

- [ ] **Step 3: Add a failing desktop/tablet rail test**

Append to `tests/e2e/responsive.spec.ts`:

```ts
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
```

- [ ] **Step 4: Run the layout tests and verify RED**

Run:

```bash
npm run test:e2e -- tests/e2e/work.spec.ts tests/e2e/research.spec.ts tests/e2e/responsive.spec.ts --grep "architecture figures|no-cover project specimen|long-form code and tables|contents rail sticky"
```

Expected: FAIL because ConstraintFlow is still 40rem, the specimen exceeds 481px, and the rail remains sticky at 1024px. The internal-scroll assertions may already pass after Task 1; the grouped test remains red until every layout behavior is implemented.

- [ ] **Step 5: Add the wide-content breakout**

Append this rule after the media element rules in `src/styles/prose.css`:

```css
.prose
  > :where(pre, table, figure:not(.quote-block), .prose-wide) {
  width: min(
    var(--reading-wide-width),
    calc(100vw - var(--page-gutter) - var(--page-gutter))
  );
  max-width: none;
  justify-self: center;
}
```

This grid-item width centers the wide child without a negative margin. On a narrow viewport the `calc(...)` branch equals the gutter-safe page width.

- [ ] **Step 6: Mark the architecture figure as intentionally wide**

Change the opening figure in `src/components/mdx/ConstraintFlow.astro` to:

```astro
<figure
  class="constraint-flow prose-wide"
  data-constraint-flow
  aria-label={label}
>
```

Do not add `.prose-wide` to `QuoteBlock.astro`.

- [ ] **Step 7: Separate specimen and real-cover heights**

In `ProjectLayout.astro`, keep the shared visual border/background rule but remove its shared `min-height`. Use:

```css
.project-layout__image,
.project-hero-specimen {
  width: 100%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.project-layout__image {
  height: 100%;
  min-height: clamp(28rem, 52vw, 43rem);
  object-fit: cover;
}

.project-hero-specimen {
  position: relative;
  display: grid;
  min-height: clamp(20rem, 36vw, 30rem);
  overflow: hidden;
  align-content: space-between;
  padding: clamp(1.5rem, 4vw, 3rem);
  isolation: isolate;
}
```

In the `max-width: 56rem` media query, apply the existing `clamp(22rem, 112vw, 36rem)` override only to `.project-layout__image`; do not override `.project-hero-specimen`.

- [ ] **Step 8: Move body/rail collapse to 64rem**

In both layouts, add a separate breakpoint:

```css
@media (max-width: 64rem) {
  .project-layout__body {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
  }

  .project-layout__rail {
    position: static;
    width: min(100%, var(--reading-width));
  }
}
```

and:

```css
@media (max-width: 64rem) {
  .content-layout__body {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
  }

  .content-layout__rail {
    position: static;
    width: min(100%, var(--reading-width));
  }
}
```

Keep Project header/facts stacking and Content metadata adjustments in their existing `max-width: 56rem` blocks. Remove duplicate body and rail declarations from those narrower blocks.

- [ ] **Step 9: Run the layout tests and verify GREEN**

Run the command from Step 4.

Expected: PASS. ConstraintFlow is wider than 40rem but no wider than 52rem, the specimen is 320–481px, the rail switches from sticky to static by 1024px, and long code/table content scrolls internally at 390px without document overflow.

- [ ] **Step 10: Run all changed E2E files and review the task diff**

Run:

```bash
npm run test:e2e -- tests/e2e/work.spec.ts tests/e2e/research.spec.ts tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts
git diff --check
git diff -- src/styles/prose.css src/layouts/ProjectLayout.astro src/layouts/ContentLayout.astro src/components/mdx/ConstraintFlow.astro tests/e2e/work.spec.ts tests/e2e/research.spec.ts tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts
```

Expected: all changed browser-test files pass; no whitespace errors; no article content change appears. Do not commit.

---

## Task 4: Format, Fully Verify, and Capture Visual Evidence

**Files:**

- Verify: all modified source and test files
- Generate locally: `artifacts/long-form-typography/mac-native-kit-desktop.png`
- Generate locally: `artifacts/long-form-typography/mac-native-kit-mobile.png`

**Interfaces:**

- Consumes: the completed implementation from Tasks 1–3.
- Produces: full validation output and two inspected screenshot artifacts with absolute paths.
- Preserves: no commit or push; generated screenshots remain local artifacts unless the user later asks to version them.

- [ ] **Step 1: Install the lockfile-defined dependencies**

Run:

```bash
npm ci
```

Expected: exit 0 with the repository’s locked dependency graph installed.

- [ ] **Step 2: Run the complete required verification sequence**

Run each command separately and record its exit status:

```bash
npm run format:check
npm run lint
npm run check
npm run test
PUBLIC_SITE_URL=https://wishsoul.github.io PUBLIC_BASE_PATH=/BashAILabBlog npm run build
npm run test:links
git diff --check
```

Expected: every command exits 0. If `format:check` reports files changed by this work, run `npm run format`, inspect the formatting diff, then repeat every command in this step from the beginning.

- [ ] **Step 3: Start the production preview for screenshot capture**

Run the already-built site in a reusable terminal session:

```bash
npm run preview -- --host 127.0.0.1 --port 4321
```

Expected: preview available at `http://127.0.0.1:4321/BashAILabBlog/`.

- [ ] **Step 4: Capture the required desktop and mobile screenshots**

Create the artifact directory, then run:

```bash
mkdir -p artifacts/long-form-typography
npx playwright screenshot --browser chromium --viewport-size="1440,900" --full-page http://127.0.0.1:4321/BashAILabBlog/zh/work/mac-native-kit/ artifacts/long-form-typography/mac-native-kit-desktop.png
npx playwright screenshot --browser chromium --viewport-size="390,844" --full-page http://127.0.0.1:4321/BashAILabBlog/zh/work/mac-native-kit/ artifacts/long-form-typography/mac-native-kit-mobile.png
```

Expected: both PNG files exist and are non-empty.

- [ ] **Step 5: Inspect all required viewports**

Use the production preview and inspect 1440×900, 1280×800, 1024×768, 768×1024, and 390×844. Confirm:

- the desktop prose column is approximately 640px;
- the contents rail is sticky at 1280 and static at 1024 and below;
- H1 and H2 wrap without clipping;
- paragraphs, lists, quotes, inline code, code blocks, and tables keep the shared scale;
- code and table overflow stays internal;
- no page-level horizontal overflow appears;
- the specimen hero no longer consumes nearly a full viewport;
- light and dark reading colors remain clear;
- Chinese metadata uses natural casing and spacing.

Open both generated PNG files with the image viewer and visually inspect the complete page. Test success is not a substitute for this step.

- [ ] **Step 6: Audit the final scope without committing**

Run:

```bash
git status --short
git diff --stat
git diff --check
```

Expected: only the approved source/test/spec/plan files and local screenshot artifacts are new or modified by this task; pre-existing unrelated untracked files remain untouched. Do not stage, commit, or push.

- [ ] **Step 7: Prepare the delivery report**

Report:

- every modified file;
- the new/changed tokens;
- the location of `.prose` implementation;
- how both layouts reuse it;
- Chinese-specific typography rules;
- the generated heading data flow and empty-rail behavior;
- absolute desktop/mobile screenshot paths;
- every verification command with pass/fail evidence;
- any remaining limitation, including the lack of a real Markdown table in current article content;
- confirmation that nothing was committed or pushed.

Do not claim completion until the commands and screenshot inspection in this task have been run in the current implementation turn.
