# Bilingual Chinese Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Publish a complete Chinese edition with paired content routes, direct language switching, translation-integrity CI, and the global GitHub profile set to https://github.com/wishsoul.

**Architecture:** Locale-aware route helpers derive English and Chinese paths from a content entry's translationKey and ID. English and Chinese archive/detail pages share components with locale props, while static pages pass known counterpart routes. A standalone Node validator enforces the content-pair contract in the Pages build.

**Tech Stack:** Astro 7 static output, MDX content collections, TypeScript, Vitest, Playwright, Node.js 22, GitHub Actions.

## Global Constraints

- Node.js remains >=22.12.0; do not add a YAML parser or another dependency for the validator.
- Keep English URLs unchanged and use /zh/ as the Chinese-route prefix.
- Content pairs use identical filenames and translationKey; their lang, prose, titles, descriptions, tags, and SEO copy are localized.
- Preserve source facts, dates, technical names, source links, project-specific repository URLs, draft, publishedAt, status, category, platform, and order values.
- Change only the global GitHub profile target to https://github.com/wishsoul; do not rewrite Work entry repository URLs.
- Do not add a Chinese RSS feed or translate external resources.

---

## File Structure

- src/lib/localized-content.ts — maps archive/detail paths by locale and returns a paired entry's route.
- src/lib/content-labels.ts — maps schema enum values to display copy without changing persisted English enum values.
- scripts/check-translation-pairs.mjs — scans Markdown/MDX front matter and exits non-zero for invalid pairs.
- src/pages/zh/** — Chinese home, archive, detail, About, and Resume routes.
- src/pages/{work,research}/[...slug].astro — English detail routes updated with Chinese counterpart URLs.
- src/components/** and src/layouts/** — receive locale-aware internal paths and translated labels.
- src/content/{work,research,log,pages}/zh/** — Chinese translations paired one-for-one with current English content.
- tests/unit/translation-pairs.test.ts and tests/unit/localized-content.test.ts — behavior tests.
- tests/e2e/{navigation,pages,work,research}.spec.ts — Chinese routes, switching, and global profile link tests.

### Task 1: Add the translation-pair validator and CI gate

**Files:**
- Create: scripts/check-translation-pairs.mjs
- Create: tests/unit/translation-pairs.test.ts
- Modify: package.json
- Modify: .github/workflows/deploy.yml

**Interfaces:**
- Produces validateTranslationPairs(entries: TranslationEntry[]): string[] for unit tests.
- Produces collectTranslationEntries(contentRoot: URL): TranslationEntry[] for tests that inspect the repository inventory.
- Produces npm run test:translations, which exits 0 only when each Chinese entry has exactly one English source and neither language duplicates a key.

- [ ] **Step 1: Write the failing validator tests**

~~~ts
import { describe, expect, it } from "vitest";
import { validateTranslationPairs } from "../../scripts/check-translation-pairs.mjs";

describe("translation-pair validation", () => {
  it("accepts one English source with one Chinese translation", () => {
    expect(validateTranslationPairs([
      { file: "work/en/demo.mdx", lang: "en", translationKey: "work.demo" },
      { file: "work/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
    ])).toEqual([]);
  });

  it("rejects a Chinese entry without an English source", () => {
    expect(validateTranslationPairs([
      { file: "work/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
    ])).toContain("work/zh/demo.mdx: no English source for translationKey work.demo");
  });

  it("rejects duplicate keys in either language", () => {
    expect(validateTranslationPairs([
      { file: "work/en/demo.mdx", lang: "en", translationKey: "work.demo" },
      { file: "research/en/demo.mdx", lang: "en", translationKey: "work.demo" },
      { file: "work/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
      { file: "research/zh/demo.mdx", lang: "zh", translationKey: "work.demo" },
    ])).toEqual(expect.arrayContaining([
      "translationKey work.demo has 2 English entries",
      "translationKey work.demo has 2 Chinese entries",
    ]));
  });
});
~~~

- [ ] **Step 2: Run the test to verify RED**

Run: npm run test:unit -- tests/unit/translation-pairs.test.ts

Expected: FAIL because scripts/check-translation-pairs.mjs does not exist.

- [ ] **Step 3: Implement the minimal validator**

~~~js
export function validateTranslationPairs(entries) {
  const byKey = new Map();
  for (const entry of entries) {
    const group = byKey.get(entry.translationKey) ?? { en: [], zh: [] };
    group[entry.lang].push(entry);
    byKey.set(entry.translationKey, group);
  }

  const errors = [];
  for (const [key, group] of byKey) {
    if (group.en.length > 1)
      errors.push("translationKey " + key + " has " + group.en.length + " English entries");
    if (group.zh.length > 1)
      errors.push("translationKey " + key + " has " + group.zh.length + " Chinese entries");
    for (const entry of group.zh)
      if (group.en.length === 0)
        errors.push(entry.file + ": no English source for translationKey " + key);
  }
  return errors;
}
~~~

Implement recursive .md/.mdx discovery under src/content/work, research, log, and pages. Parse only the bounded front-matter block and extract required scalar lang and translationKey lines. The executable prints each error to stderr and sets a non-zero exit code.

- [ ] **Step 4: Expose and run the CI command**

Add this package script:

~~~json
"test:translations": "node scripts/check-translation-pairs.mjs"
~~~

Add this Pages build-job step after npm run test and before npm run build:

~~~yaml
- run: npm run test:translations
~~~

- [ ] **Step 5: Verify GREEN**

Run: npm run test:unit -- tests/unit/translation-pairs.test.ts

Expected: all three tests pass. The repository-wide command remains red until Tasks 6–7 create every Chinese counterpart.

- [ ] **Step 6: Commit the validator slice**

~~~bash
git add scripts/check-translation-pairs.mjs tests/unit/translation-pairs.test.ts package.json .github/workflows/deploy.yml
git commit -m "feat: validate translation content pairs"
~~~

### Task 2: Introduce locale-aware routes and counterpart lookup

**Files:**
- Create: src/lib/localized-content.ts
- Create: tests/unit/localized-content.test.ts
- Modify: src/lib/content.ts

**Interfaces:**
- Produces localizedPath(locale, path): string.
- Produces contentPath(locale, collection, id): string.
- Produces translationPath(entries, entry, collection): string | undefined.

- [ ] **Step 1: Write the failing helper tests**

~~~ts
import { expect, it } from "vitest";
import {
  contentPath,
  localizedPath,
  translationPath,
} from "../../src/lib/localized-content";

it("uses stable Chinese and English content routes", () => {
  expect(localizedPath("zh", "/work/")).toBe("/zh/work/");
  expect(contentPath("zh", "research", "zh/ai-native-interfaces.mdx"))
    .toBe("/zh/research/ai-native-interfaces/");
  expect(contentPath("en", "pages", "en/about.mdx")).toBe("/about/");
});

it("returns the paired detail route from translationKey", () => {
  const en = { id: "en/demo.mdx", data: { lang: "en", translationKey: "work.demo" } };
  const zh = { id: "zh/demo.mdx", data: { lang: "zh", translationKey: "work.demo" } };
  expect(translationPath([en, zh], en, "work")).toBe("/zh/work/demo/");
});
~~~

- [ ] **Step 2: Run the test to verify RED**

Run: npm run test:unit -- tests/unit/localized-content.test.ts

Expected: FAIL because src/lib/localized-content.ts does not exist.

- [ ] **Step 3: Implement the helper module**

~~~ts
import type { Locale } from "../config/site";
import { contentSlug, pairTranslations } from "./content";

export function localizedPath(locale: Locale, path: string): string {
  const normalized = "/" + path.replace(/^\/+/, "");
  return locale === "zh" ? "/zh" + normalized : normalized;
}

export function contentPath(
  locale: Locale,
  collection: "work" | "research" | "pages",
  id: string,
): string {
  const slug = contentSlug(id);
  return localizedPath(
    locale,
    collection === "pages" ? "/" + slug + "/" : "/" + collection + "/" + slug + "/",
  );
}
~~~

Add translationPath with the same generic entry constraint as pairTranslations: get the opposite locale from the translationKey map, return contentPath for the counterpart, and return undefined when no counterpart exists.

- [ ] **Step 4: Verify GREEN**

Run: npm run test:unit -- tests/unit/localized-content.test.ts tests/unit/content.test.ts

Expected: both files pass and contentSlug still removes locale folders.

- [ ] **Step 5: Commit the helper slice**

~~~bash
git add src/lib/localized-content.ts tests/unit/localized-content.test.ts src/lib/content.ts
git commit -m "feat: add localized content paths"
~~~

### Task 3: Localize shared navigation, labels, and layouts

**Files:**
- Create: src/lib/content-labels.ts
- Modify: src/config/site.ts
- Modify: src/i18n/en.ts
- Modify: src/i18n/zh.ts
- Modify: src/components/navigation/SiteHeader.astro
- Modify: src/components/navigation/MobileNavigation.astro
- Modify: src/components/layout/SiteFooter.astro
- Modify: src/components/layout/HeroSection.astro
- Modify: src/components/content/ArticleListItem.astro
- Modify: src/components/content/ResearchIndex.astro
- Modify: src/components/work/ProjectFeature.astro
- Modify: src/components/work/ProjectListItem.astro
- Modify: src/components/work/ProjectMetadata.astro
- Modify: src/components/work/StatusIndicator.astro
- Modify: src/components/work/WorkFilter.astro
- Modify: src/components/content/EditorialPage.astro
- Modify: src/layouts/ContentLayout.astro
- Modify: src/layouts/ProjectLayout.astro
- Modify: tests/e2e/navigation.spec.ts

**Interfaces:**
- Components that construct an internal content URL accept locale: Locale.
- Detail layouts accept translationPath?: string and calculate their canonical/current-language route through contentPath.
- content-labels exports displayContentLabel(locale, value) for Work categories/statuses, Research categories/statuses, and Log types.

- [ ] **Step 1: Write failing browser assertions**

~~~ts
test("uses the Chinese profile URL in every global GitHub link", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "GitHub" }))
    .toHaveAttribute("href", "https://github.com/wishsoul");
  await expect(page.locator("footer").getByRole("link", { name: "GitHub" }))
    .toHaveAttribute("href", "https://github.com/wishsoul");
});

test("keeps Chinese navigation inside the Chinese edition", async ({ page }) => {
  await page.goto("./zh/");
  await expect(page.getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: "作品" }))
    .toHaveAttribute("href", "/BashAILabBlog/zh/work/");
});
~~~

- [ ] **Step 2: Run the assertions to verify RED**

Run: npm run test:e2e -- tests/e2e/navigation.spec.ts -g "Chinese profile|Chinese navigation"

Expected: FAIL because the profile uses bashxu and /zh/work/ does not exist.

- [ ] **Step 3: Implement locale-owned links and labels**

Set the sole global profile value in src/config/site.ts:

~~~ts
github: "https://github.com/wishsoul",
~~~

Add localized archive labels, breadcrumbs, home-section text, metadata labels, Work categories, Research categories/statuses, Log types, and Work status labels to UiCopy. Keep persisted content enums in English and convert only when rendering.

Every shared internal-link component uses this pattern:

~~~ts
const href = withBase(
  localizedPath(locale, "/research/" + contentSlug(entry.id) + "/"),
);
~~~

In SiteHeader, MobileNavigation, and SiteFooter localize the brand, nav, Work/Research/Log/About links, and Resume fallback path. Keep /rss.xml as the English feed. In ContentLayout, ProjectLayout, and EditorialPage derive canonical and breadcrumb paths through contentPath and forward translationPath to BaseLayout. Format Chinese visible dates with zh-CN.

- [ ] **Step 4: Verify GREEN**

Run: npm run test:e2e -- tests/e2e/navigation.spec.ts -g "Chinese profile|Chinese navigation"

Expected: both tests pass and Work entry GitHub URLs remain unchanged.

- [ ] **Step 5: Commit the shared UI slice**

~~~bash
git add src/config/site.ts src/i18n src/lib/content-labels.ts src/components src/layouts tests/e2e/navigation.spec.ts
git commit -m "feat: localize shared site navigation"
~~~

### Task 4: Publish Chinese archive, detail, and editorial routes

**Files:**
- Modify: src/pages/index.astro
- Modify: src/pages/work/index.astro
- Modify: src/pages/work/[...slug].astro
- Modify: src/pages/research/index.astro
- Modify: src/pages/research/[...slug].astro
- Modify: src/pages/log/index.astro
- Modify: src/pages/about/index.astro
- Modify: src/pages/resume/index.astro
- Modify: src/pages/zh/index.astro
- Create: src/pages/zh/work/index.astro
- Create: src/pages/zh/work/[...slug].astro
- Create: src/pages/zh/research/index.astro
- Create: src/pages/zh/research/[...slug].astro
- Create: src/pages/zh/log/index.astro
- Create: src/pages/zh/about/index.astro
- Create: src/pages/zh/resume/index.astro
- Modify: tests/e2e/pages.spec.ts
- Modify: tests/e2e/work.spec.ts
- Create: tests/e2e/research.spec.ts

**Interfaces:**
- Every detail route invokes translationPath(collectionEntries, entry, collection) and passes it to the layout.
- Every archive/static route passes its known opposite-language route into BaseLayout.

- [ ] **Step 1: Write failing Chinese-route browser tests**

~~~ts
test("publishes the Chinese home and content archives", async ({ page }) => {
  await page.goto("./zh/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.getByRole("heading", { level: 1, name: /帮助个人/ })).toBeVisible();
  await page.goto("./zh/work/");
  await expect(page.getByRole("heading", { level: 1, name: "作品" })).toBeVisible();
  await page.goto("./zh/research/");
  await expect(page.getByRole("heading", { level: 1, name: "研究" })).toBeVisible();
  await page.goto("./zh/log/");
  await expect(page.getByRole("heading", { level: 1, name: "日志" })).toBeVisible();
});

test("switches the published paired Work detail between languages", async ({ page }) => {
  await page.goto("./work/mac-native-kit/");
  await expect(page.getByRole("link", { name: "切换到中文" }).first())
    .toHaveAttribute("href", "/BashAILabBlog/zh/work/mac-native-kit/");
});
~~~

- [ ] **Step 2: Run the tests to verify RED**

Run: npm run test:e2e -- tests/e2e/pages.spec.ts tests/e2e/work.spec.ts tests/e2e/research.spec.ts -g "Chinese home|published paired Work"

Expected: FAIL because Chinese paths return missing pages or the old preparation copy.

- [ ] **Step 3: Add counterpart links to existing English routes**

For every English collection route, retain lang === "en" filtering and add translationPath. Detail construction follows this shape:

~~~ts
const entries = await getCollection("work");
return visibleEntries(entries, import.meta.env.PROD)
  .filter((entry) => entry.data.lang === "en")
  .map((entry) => ({
    params: { slug: contentSlug(entry.id) },
    props: {
      entry,
      translationPath: translationPath(entries, entry, "work"),
    },
  }));
~~~

Archive pages pass /zh/work/, /zh/research/, and /zh/log/. About and Resume pass /zh/about/ and /zh/resume/. The English home passes /zh/.

- [ ] **Step 4: Implement the Chinese route tree**

Replace src/pages/zh/index.astro with a Chinese home that mirrors English selection logic using lang === "zh", Chinese UI copy, localized component props, canonical /zh/, and translation path /.

For Chinese Work and Research details, filter lang === "zh", use contentSlug, render the shared layouts, and pass the English counterpart. For Chinese archives, use locale-aware components and canonical paths /zh/work/, /zh/research/, and /zh/log/. For About and Resume, find zh/about and zh/resume, render EditorialPage, and pass /about/ and /resume/.

- [ ] **Step 5: Verify GREEN**

Run: npm run test:e2e -- tests/e2e/pages.spec.ts tests/e2e/work.spec.ts tests/e2e/research.spec.ts -g "Chinese home|published paired Work"

Expected: Chinese archives render localized content and each tested detail switch points to its paired URL.

- [ ] **Step 6: Commit the route slice**

~~~bash
git add src/pages tests/e2e/pages.spec.ts tests/e2e/work.spec.ts tests/e2e/research.spec.ts
git commit -m "feat: publish Chinese content routes"
~~~

### Task 5: Translate and pair every Work and Research entry

**Files:**
- Create: src/content/work/zh/pastepop.mdx
- Create: src/content/work/zh/tidypilot.mdx
- Create: src/content/work/zh/wordgrill.mdx
- Review: src/content/work/zh/mac-native-kit.mdx
- Create: src/content/research/zh/agentic-development.mdx
- Create: src/content/research/zh/ai-native-interfaces.mdx
- Create: src/content/research/zh/designing-constraint-system-ai-ui.mdx
- Create: src/content/research/zh/from-l3-to-l4-agentic-development.mdx
- Create: src/content/research/zh/github-issues-source-of-truth.mdx
- Create: src/content/research/zh/human-checkpoints-autonomous-development.mdx
- Create: src/content/research/zh/independent-products.mdx
- Create: src/content/research/zh/why-functional-tests-fail-user-journeys.mdx

**Interfaces:**
- Each new entry has the same file stem and translationKey as its English source, lang: zh, and all schema-required metadata.

- [ ] **Step 1: Add the failing repository-completeness assertion**

~~~ts
import { collectTranslationEntries } from "../../scripts/check-translation-pairs.mjs";

it("accepts the repository content inventory", () => {
  const entries = collectTranslationEntries(
    new URL("../../src/content/", import.meta.url),
  );
  const englishKeys = entries
    .filter((entry) => entry.lang === "en")
    .map((entry) => entry.translationKey)
    .sort();
  const chineseKeys = entries
    .filter((entry) => entry.lang === "zh")
    .map((entry) => entry.translationKey)
    .sort();
  expect(chineseKeys).toEqual(englishKeys);
});
~~~

- [ ] **Step 2: Run the assertion to verify RED**

Run: npm run test:unit -- tests/unit/translation-pairs.test.ts

Expected: it reports every untranslated Work and Research translationKey.

- [ ] **Step 3: Translate the entries**

For every source file, copy its exact front matter values and preserve its schema enum values and dates. The following shape is illustrative only; replace every shown value with its source entry's corresponding value before localizing reader-visible text:

~~~mdx
---
title: 中文标题
translationKey: research.agentic-development
lang: zh
description: 中文摘要。
kind: article
category: Agentic Development
status: Essay
publishedAt: 2026-07-16
featured: false
draft: false
tags: [智能体开发, AI 产品]
seo:
  title: 中文 SEO 标题 — Bash AI Lab
  description: 中文 SEO 摘要。
---
~~~

Translate headings, prose, lists, captions, and MDX component props. Preserve code fences, link targets, technical proper names such as SwiftUI, AppKit, Codex, DSL, and GitHub, and original project-specific URLs. Review existing mac-native-kit.mdx against its English source and complete any untranslated reader-visible prose.

- [ ] **Step 4: Verify this content slice**

Run: npm run check

Expected: Astro validates all Work and Research content. Do not run the repository-wide translation validator as passing until Task 6 adds Log and pages.

- [ ] **Step 5: Commit Work and Research translations**

~~~bash
git add src/content/work/zh src/content/research/zh tests/unit/translation-pairs.test.ts
git commit -m "content: add Chinese work and research"
~~~

### Task 6: Translate and pair Log, About, and Resume content

**Files:**
- Create: src/content/log/zh/2026-07-09-tidypilot-scope.md
- Create: src/content/log/zh/2026-07-14-human-approval.md
- Create: src/content/log/zh/2026-07-15-ux-testing.md
- Create: src/content/pages/zh/about.mdx
- Create: src/content/pages/zh/resume.mdx

**Interfaces:**
- The validator receives a complete bilingual repository and returns no errors.
- Chinese Log entries retain source dates and type enum values; Chinese pages retain pages.about and pages.resume translation keys.

- [ ] **Step 1: Confirm the final missing-translation RED state**

Run: npm run test:unit -- tests/unit/translation-pairs.test.ts

Expected: the repository-completeness assertion fails because the five Chinese Log/About/Resume counterparts are absent; the directional validator tests continue to pass because English-only entries are valid for future staged publishing.

- [ ] **Step 2: Create paired Chinese Markdown and MDX files**

Copy each English front matter block, set lang: zh, preserve the source filename and translationKey, localize all reader-visible strings, and preserve dates and enum values. For Logs translate title, description, summary, tags, SEO text, and body. For About and Resume translate every heading, paragraph, list, and SEO field without adding unsupported biographical claims.

- [ ] **Step 3: Verify GREEN**

Run: npm run check && npm run test:translations && npm run test:unit -- tests/unit/translation-pairs.test.ts

Expected: every command succeeds with no missing or duplicate translation keys.

- [ ] **Step 4: Commit the remaining translations**

~~~bash
git add src/content/log/zh src/content/pages/zh
git commit -m "content: complete Chinese edition translations"
~~~

### Task 7: Run release verification and inspect generated bilingual artifacts

**Files:**
- Modify only files named by a failing verification command; each repair repeats its narrow test before the full suite.

**Interfaces:**
- The Pages workflow translation gate, test suite, static build, and link checker all succeed.

- [ ] **Step 1: Run focused application tests**

Run: npm run test:unit && npm run test:e2e

Expected: all unit and browser tests pass, including Chinese archives, direct language switching, and the new global GitHub target.

- [ ] **Step 2: Run static and release checks**

~~~bash
npm run format:check
npm run lint
npm run check
npm run audit:production
PUBLIC_SITE_URL=https://wishsoul.github.io PUBLIC_BASE_PATH=/BashAILabBlog npm run build
npm run test:translations
npm run test:links
git diff --check
~~~

Expected: every command exits 0 and the build includes /zh/ archive/detail pages with no invalid base-path references.

- [ ] **Step 3: Inspect representative generated pages**

~~~bash
rg -n 'hreflang="zh"|/zh/work/mac-native-kit/|https://github.com/wishsoul' dist/index.html dist/work/mac-native-kit/index.html dist/zh/index.html dist/zh/work/mac-native-kit/index.html
~~~

Expected: English and Chinese details point to one another, and the global profile URL is https://github.com/wishsoul.

- [ ] **Step 4: Commit a verification-driven repair only if a repair was needed**

~~~bash
git add src scripts tests .github package.json
git commit -m "fix: validate Chinese edition release"
~~~
