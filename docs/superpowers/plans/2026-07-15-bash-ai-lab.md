# Bash AI Lab Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the English-first, bilingual-ready Bash AI Lab static website for deployment at `https://bashxu.github.io/BashAILabBlog/`.

**Architecture:** Start from the official Astro Minimal scaffold, keep rendering static and Astro-native, and drive Work, Research, Log, and editorial pages from strict Content Collections. Central site, locale, URL, design-token, and content-query modules feed focused layouts and components; all generated URLs are base-path safe and tested against `/BashAILabBlog/`.

**Tech Stack:** Node.js 22.12 or newer, npm 9.6.5 or newer, Astro 7.0.9, TypeScript strict mode, Tailwind CSS 4.3.2 through `@tailwindcss/vite`, Geist and Geist Mono variable fonts, Astro MDX/Sitemap/RSS, Vitest, Playwright Chromium, ESLint, and Prettier.

## Global Constraints

- Use static Astro output and Astro components; do not add React or Vue.
- English is the default locale. Chinese uses `/zh/`; untranslated content is never machine-generated.
- Default deployment is `PUBLIC_SITE_URL=https://bashxu.github.io` and `PUBLIC_BASE_PATH=/BashAILabBlog`.
- Every internal link, asset URL, canonical, feed URL, and structured-data URL must be base-path safe.
- Preserve `createsiteprompt.md` and the approved design spec.
- Do not fabricate project screenshots, metrics, testimonials, or outcomes.
- Missing project media uses the approved typographic specimen treatment.
- Meaningful UI text is at least 11.25px; body text starts at 15px.
- Use the exact light and dark color tokens in the design spec; accent color remains sparse.
- Respect keyboard navigation and `prefers-reduced-motion`.
- Production queries, RSS, and Sitemap must exclude `draft: true` content.
- Every task ends with its focused checks and a commit; never defer all testing to the final task.

---

## File and Responsibility Map

```text
astro.config.mjs                 Static output, integrations, site/base configuration
src/content.config.ts            Work, Research, Log, and Pages schemas
src/config/site.ts               Brand, navigation, locales, social links, environment defaults
src/i18n/{en,zh,index}.ts        Typed interface copy and locale helpers
src/lib/urls.ts                  Base-path and absolute URL construction
src/lib/content.ts               Draft filtering, ordering, translation pairing, reading time
src/lib/seo.ts                   Canonical, social metadata, and JSON-LD builders
src/styles/global.css            Tailwind import, tokens, typography, themes, focus, motion
src/layouts/BaseLayout.astro     Document shell, theme bootstrap, metadata, header/footer
src/layouts/ContentLayout.astro  Research and editorial prose shell
src/layouts/ProjectLayout.astro  Project case-study shell
src/components/navigation/*      Header, mobile disclosure, theme, language navigation
src/components/layout/*          Footer, section headers, breadcrumb, back-to-top
src/components/work/*            Work features, metadata, filters, status, Lab Status
src/components/content/*         Research lists, Log timeline, tags, external links, TOC
src/components/mdx/*             Callout, metric, Mermaid, timeline, quote, before/after
src/pages/*                       English static routes, collection routes, RSS, robots, 404
src/pages/zh/index.astro          Honest Chinese edition-status page
tests/unit/*                     Pure helper and schema-adjacent behavior
tests/e2e/*                      User-visible routes, navigation, themes, responsive/base path
scripts/check-links.mjs          Production-dist internal-link and asset validator
scripts/generate-og.mjs          Deterministic typographic social-image generator
.github/workflows/deploy.yml     Check, test, build, upload, and deploy GitHub Pages
README.md                         Content authoring, configuration, deployment, and operations
```

### Task 1: Scaffold the Astro foundation and quality commands

**Files:**
- Modify: `.gitignore`
- Create from scaffold: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/styles/global.css`, `public/favicon.svg`
- Create: `.env.example`, `eslint.config.js`, `.prettierrc.mjs`, `vitest.config.ts`, `playwright.config.ts`

**Interfaces:**
- Consumes: approved design spec and the existing Git repository.
- Produces: npm scripts `dev`, `build`, `preview`, `check`, `lint`, `format`, `format:check`, `test`, `test:unit`, `test:e2e`, and `test:links`.

- [ ] **Step 1: Create the official Minimal scaffold without overwriting the non-empty repository**

The verified `create-astro` 5.2.2 CLI chooses a random directory when `.` is non-empty. Scaffold in an isolated temporary directory, copy the template files, and keep the current Git history:

```bash
SCAFFOLD_DIR="$(mktemp -d /tmp/bash-ai-lab-astro.XXXXXX)"
npm create astro@latest "$SCAFFOLD_DIR" -- --template minimal --no-install --no-git --no-ai --yes --skip-houston
rsync -a --exclude node_modules "$SCAFFOLD_DIR"/ ./
rm -rf "$SCAFFOLD_DIR"
```

Expected: the root gains the Astro Minimal files while `createsiteprompt.md`, `docs/`, and `.git/` remain intact.

- [ ] **Step 2: Install the smallest required dependency set**

```bash
npm install @astrojs/mdx @astrojs/rss @astrojs/sitemap @fontsource-variable/geist @fontsource-variable/geist-mono mermaid tailwindcss @tailwindcss/vite
npm install --save-dev @astrojs/check @eslint/js @playwright/test @types/node eslint eslint-plugin-astro lighthouse prettier prettier-plugin-astro typescript typescript-eslint vitest
npx playwright install chromium
```

Expected: one npm lockfile, no React or Vue package, and Chromium installed for smoke tests.

- [ ] **Step 3: Configure strict TypeScript and scripts**

Set `tsconfig.json` to:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "playwright-report", "test-results"]
}
```

Set the script block in `package.json` to:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:links": "node scripts/check-links.mjs"
  }
}
```

- [ ] **Step 4: Add deterministic formatting, lint, and test configuration**

Use Astro's flat ESLint parser, TypeScript recommended rules, `prettier-plugin-astro`, a `jsdom`-free Vitest node environment, and this Playwright server contract:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4321/BashAILabBlog/',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'PUBLIC_SITE_URL=http://127.0.0.1:4321 PUBLIC_BASE_PATH=/BashAILabBlog npm run build && npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/BashAILabBlog/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Record environment defaults and ignores**

```dotenv
# .env.example
PUBLIC_SITE_URL=https://bashxu.github.io
PUBLIC_BASE_PATH=/BashAILabBlog
PUBLIC_EMAIL=
PUBLIC_RESUME_PATH=
```

Append `.tmp/`, `coverage/`, and `*.log` to `.gitignore` without removing the existing `.superpowers/`, build, test, and environment exclusions.

- [ ] **Step 6: Verify and commit the foundation**

Run:

```bash
npm run check
npm run lint
npm run format:check
npm run build
```

Expected: every command exits 0 and `dist/index.html` exists.

```bash
git add .gitignore .env.example package.json package-lock.json astro.config.mjs tsconfig.json eslint.config.js .prettierrc.mjs vitest.config.ts playwright.config.ts public src
git commit -m "chore: scaffold Astro foundation"
```

### Task 2: Implement site configuration and base-path-safe URLs with TDD

**Files:**
- Create: `src/config/site.ts`, `src/lib/urls.ts`, `tests/unit/urls.test.ts`
- Modify: `astro.config.mjs`, `vitest.config.ts`

**Interfaces:**
- Produces: `Locale`, `SITE`, `NAV_ITEMS`, `normalizeBase(base)`, `withBase(path, base?)`, and `absoluteUrl(path, options?)`.
- Consumed by: every layout, page, feed, structured-data builder, and link test.

- [ ] **Step 1: Write failing URL tests**

```ts
// tests/unit/urls.test.ts
import { describe, expect, it } from 'vitest';
import { absoluteUrl, normalizeBase, withBase } from '../../src/lib/urls';

describe('URL helpers', () => {
  it('normalizes an empty or project base', () => {
    expect(normalizeBase('')).toBe('/');
    expect(normalizeBase('BashAILabBlog/')).toBe('/BashAILabBlog/');
  });

  it('prefixes internal routes once', () => {
    expect(withBase('/work/', '/BashAILabBlog')).toBe('/BashAILabBlog/work/');
    expect(withBase('/BashAILabBlog/work/', '/BashAILabBlog')).toBe('/BashAILabBlog/work/');
  });

  it('leaves external and fragment links unchanged', () => {
    expect(withBase('https://github.com/bashxu', '/BashAILabBlog')).toBe('https://github.com/bashxu');
    expect(withBase('#main', '/BashAILabBlog')).toBe('#main');
  });

  it('builds the canonical project URL', () => {
    expect(
      absoluteUrl('/work/', {
        siteUrl: 'https://bashxu.github.io',
        basePath: '/BashAILabBlog',
      }),
    ).toBe('https://bashxu.github.io/BashAILabBlog/work/');
  });
});
```

- [ ] **Step 2: Run the test and verify the intended failure**

Run: `npm run test:unit -- tests/unit/urls.test.ts`

Expected: FAIL because `src/lib/urls.ts` does not exist.

- [ ] **Step 3: Implement typed site and URL configuration**

```ts
// src/config/site.ts
export type Locale = 'en' | 'zh';

export const SITE = {
  name: 'Bash AI Lab',
  title: 'Bash AI Lab — AI Product Research & Independent Software',
  description: 'AI product research, agentic development systems and independent software built by Bash.',
  siteUrl: import.meta.env.PUBLIC_SITE_URL ?? 'https://bashxu.github.io',
  basePath: import.meta.env.PUBLIC_BASE_PATH ?? '/BashAILabBlog',
  defaultLocale: 'en' as const,
  locales: ['en', 'zh'] as const,
  github: 'https://github.com/bashxu',
  email: import.meta.env.PUBLIC_EMAIL || null,
  resumeDownload: import.meta.env.PUBLIC_RESUME_PATH || null,
} as const;

export const NAV_ITEMS = [
  { key: 'work', href: '/work/' },
  { key: 'research', href: '/research/' },
  { key: 'log', href: '/log/' },
  { key: 'about', href: '/about/' },
] as const;
```

```ts
// src/lib/urls.ts
import { SITE } from '../config/site';

export function normalizeBase(base: string): string {
  if (!base || base === '/') return '/';
  return `/${base.replace(/^\/+|\/+$/g, '')}/`;
}

export function withBase(path: string, base = SITE.basePath): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:')) return path;
  const normalizedBase = normalizeBase(base);
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;
  if (normalizedBase !== '/' && normalizedPath.startsWith(normalizedBase)) return normalizedPath;
  return normalizedBase === '/' ? normalizedPath : `${normalizedBase.slice(0, -1)}${normalizedPath}`;
}

export function absoluteUrl(
  path: string,
  options: { siteUrl?: string; basePath?: string } = {},
): string {
  const siteUrl = options.siteUrl ?? SITE.siteUrl;
  const basePath = options.basePath ?? SITE.basePath;
  return new URL(withBase(path, basePath), `${siteUrl.replace(/\/+$/, '')}/`).toString();
}
```

Configure Astro with `output: 'static'`, `site`, `base`, MDX, Sitemap, and the Tailwind Vite plugin using `process.env.PUBLIC_SITE_URL` and `process.env.PUBLIC_BASE_PATH` defaults matching `SITE`.

- [ ] **Step 4: Run focused and project checks**

Run:

```bash
npm run test:unit -- tests/unit/urls.test.ts
npm run check
npm run build
```

Expected: four URL tests pass, Astro Check exits 0, and the build output is rooted at `/BashAILabBlog/`.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/config/site.ts src/lib/urls.ts tests/unit/urls.test.ts vitest.config.ts
git commit -m "feat: add site and URL configuration"
```

### Task 3: Define content schemas and pure content queries with TDD

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Produces: collections `work`, `research`, `log`, `pages`; enums `WORK_STATUSES`, `WORK_CATEGORIES`; helpers `visibleEntries`, `sortByOrderThenDate`, `pairTranslations`, `contentSlug`, `estimateReadingMinutes`.
- Consumed by: Home, Work, Research, Log, RSS, Sitemap, and language navigation.

- [ ] **Step 1: Write failing pure-helper tests**

```ts
// tests/unit/content.test.ts
import { describe, expect, it } from 'vitest';
import { contentSlug, estimateReadingMinutes, pairTranslations, sortByOrderThenDate, visibleEntries } from '../../src/lib/content';

const entries = [
  { id: 'b', data: { draft: false, order: 2, publishedAt: new Date('2026-07-15') } },
  { id: 'a', data: { draft: false, order: 1, publishedAt: new Date('2026-07-14') } },
  { id: 'draft', data: { draft: true, order: 0, publishedAt: new Date('2026-07-16') } },
];

describe('content helpers', () => {
  it('removes drafts for production', () => expect(visibleEntries(entries, true).map((entry) => entry.id)).toEqual(['b', 'a']));
  it('sorts order before reverse date', () => expect(sortByOrderThenDate(entries).map((entry) => entry.id)).toEqual(['draft', 'a', 'b']));
  it('pairs translations by key', () => {
    const paired = pairTranslations([
      { id: 'en', data: { lang: 'en' as const, translationKey: 'about' } },
      { id: 'zh', data: { lang: 'zh' as const, translationKey: 'about' } },
    ]);
    expect(paired.get('about')?.get('zh')?.id).toBe('zh');
  });
  it('removes locale folders and content extensions from slugs', () => {
    expect(contentSlug('en/mac-native-kit.mdx')).toBe('mac-native-kit');
  });
  it('returns at least one reading minute', () => expect(estimateReadingMinutes('short note')).toBe(1));
});
```

- [ ] **Step 2: Verify failure**

Run: `npm run test:unit -- tests/unit/content.test.ts`

Expected: FAIL because the content helper module does not exist.

- [ ] **Step 3: Implement schemas with exact enums and shared fields**

Use Astro's `glob` loader and `defineCollection`. Define shared fields `lang`, `translationKey`, `title`, `description`, `draft`, `tags`, `updatedAt`, and nested `seo`. Work additionally requires every field from the approved spec. Use these exact enums:

```ts
export const WORK_STATUSES = [
  'Exploring', 'Researching', 'Designing', 'Building',
  'Testing', 'Active', 'Paused', 'Shipped',
] as const;
export const WORK_CATEGORIES = ['Products', 'Infrastructure', 'Experiments'] as const;
export const RESEARCH_CATEGORIES = [
  'Agentic Development', 'AI-Native Interfaces', 'Independent Products',
  'AI Product Management', 'Human-AI Collaboration',
] as const;
export const RESEARCH_STATUSES = ['Note', 'Essay', 'Research', 'Experiment', 'Framework', 'Case Study'] as const;
export const LOG_TYPES = ['Build Log', 'Research Note', 'Experiment', 'Changelog', 'Decision'] as const;
```

Use `z.coerce.date()` for known dates, `z.number().int().nullable()` for Work `year`, `z.coerce.date().nullable()` for unverified `startedAt` and Research `publishedAt`, `z.string().url()` for external links, `image().optional()` for real media, and `.default(false)` for `draft` and `featured`. Research adds `kind: z.enum(['theme', 'article'])`; a schema refinement requires a date for every non-draft article, while theme entries may omit it.

- [ ] **Step 4: Implement the tested pure helpers**

```ts
// src/lib/content.ts
import type { Locale } from '../config/site';

type Entry<T> = { id: string; data: T };

export function visibleEntries<T extends { draft: boolean }>(entries: Entry<T>[], production: boolean) {
  return production ? entries.filter((entry) => !entry.data.draft) : entries;
}

export function sortByOrderThenDate<T extends { order?: number; publishedAt?: Date | null }>(entries: Entry<T>[]) {
  return [...entries].sort((a, b) =>
    (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
    (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0),
  );
}

export function pairTranslations<T extends { lang: Locale; translationKey: string }>(entries: Entry<T>[]) {
  const pairs = new Map<string, Map<Locale, Entry<T>>>();
  for (const entry of entries) {
    const group = pairs.get(entry.data.translationKey) ?? new Map<Locale, Entry<T>>();
    group.set(entry.data.lang, entry);
    pairs.set(entry.data.translationKey, group);
  }
  return pairs;
}

export function contentSlug(id: string): string {
  return id.replace(/^(?:en|zh)\//, '').replace(/\.(?:md|mdx)$/, '');
}

export function estimateReadingMinutes(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/u).filter(Boolean).length / 220));
}
```

- [ ] **Step 5: Run checks and commit**

Run:

```bash
npm run test:unit -- tests/unit/content.test.ts
npm run check
```

Expected: all content helper tests pass and collection types compile.

```bash
git add src/content.config.ts src/lib/content.ts tests/unit/content.test.ts
git commit -m "feat: define content collections"
```

### Task 4: Add honest initial content and validate collection behavior

**Files:**
- Create: `src/content/work/en/{mac-native-kit,pastepop,wordgrill,tidypilot}.mdx`
- Create: `src/content/research/en/{agentic-development,ai-native-interfaces,independent-products,why-functional-tests-fail-user-journeys,from-l3-to-l4-agentic-development,designing-constraint-system-ai-ui,github-issues-source-of-truth,human-checkpoints-autonomous-development}.mdx`
- Create: `src/content/log/en/{2026-07-15-ux-testing,2026-07-14-human-approval,2026-07-09-tidypilot-scope}.md`
- Create: `src/content/pages/en/{about,resume}.mdx`
- Create: `tests/unit/content-files.test.ts`

**Interfaces:**
- Produces: complete English collection entries for all required launch routes and homepage sections.
- Consumed by: all content-driven page tasks.

- [ ] **Step 1: Write a failing collection integrity test**

The test reads the launch source files with Node's `fs` API, asserts the exact four Work filenames, asserts every file declares `lang: en`, `draft: false`, and no `cover`, and rejects unsupported percentage claims. Astro Check remains the authoritative schema validation.

```ts
import { readdirSync, readFileSync } from 'node:fs';

const files = readdirSync(new URL('../../src/content/work/en/', import.meta.url)).sort();
expect(files).toEqual(['mac-native-kit.mdx', 'pastepop.mdx', 'tidypilot.mdx', 'wordgrill.mdx']);
for (const file of files) {
  const source = readFileSync(new URL(`../../src/content/work/en/${file}`, import.meta.url), 'utf8');
  expect(source).toContain('lang: en');
  expect(source).toContain('draft: false');
  expect(source).not.toMatch(/^cover:/m);
  expect(source).not.toMatch(/\b\d+(?:\.\d+)?%\b/u);
}
```

- [ ] **Step 2: Verify the missing-content failure**

Run: `npm run test:unit -- tests/unit/content-files.test.ts`

Expected: FAIL because the launch content files do not exist.

- [ ] **Step 3: Add Work frontmatter and qualitative case-study bodies**

Use this exact MacNativeKit frontmatter shape and the corresponding values from the matrix for the other entries:

```mdx
---
title: MacNativeKit
translationKey: work.mac-native-kit
lang: en
description: Constraint runtime for AI-generated native macOS interfaces.
year: null
startedAt: null
status: Active
category: Infrastructure
featured: true
draft: false
tags: [AI UI, SwiftUI, AppKit, Design System, DSL, Runtime, Validator, Codegen]
platform: macOS
role: Product strategy, system design, and implementation
order: 1
seo:
  title: MacNativeKit — Bash AI Lab
  description: A constraint runtime, design token, validation, and code generation system for AI-generated native macOS interfaces.
---
```

| Slug | Status | Category | Featured | Order | Description |
| --- | --- | --- | --- | ---: | --- |
| `pastepop` | Building | Products | true | 2 | A lightweight and privacy-focused clipboard history tool for macOS. |
| `wordgrill` | Testing | Products | true | 3 | An AI-assisted vocabulary learning system built around meaning, chunks, boundaries and semantic relations. |
| `tidypilot` | Researching | Products | true | 4 | An affordable and intelligent Mac cleanup assistant. |

Each case study uses the exact headings Problem, Insight, Product Strategy, Solution, AI / Technical Approach, My Role, Artifacts, Results, Learnings, and Next Step. `year` and `startedAt` stay `null` until verified source dates are supplied, and the UI omits those rows. Where evidence is not available, write a qualitative statement such as “No public quantitative result is claimed in this initial profile” instead of inserting an unverified stand-in or invented number.

- [ ] **Step 4: Add Research, Log, About, and Resume content**

Use the five supplied article titles verbatim. The three dated articles from the brief are published with those exact dates. “How GitHub Issues Become the Source of Truth for AI Development” and “Human Checkpoints in Autonomous Software Development” are stored with `draft: true` and `publishedAt: null` until verified dates and bodies exist. The three theme landing entries use slugs `agentic-development`, `ai-native-interfaces`, and `independent-products`, `kind: theme`, status `Framework`, and concise scope descriptions. About follows the six numbered sections in the design spec. Resume contains only confirmed positioning, focus, and project roles; it does not add employers, dates, or credentials not present in the brief.

- [ ] **Step 5: Run collection checks and commit**

Run:

```bash
npm run test:unit -- tests/unit/content-files.test.ts
npm run check
npm run build
```

Expected: content integrity passes, all MDX compiles, and no draft appears in generated output.

```bash
git add src/content tests/unit/content-files.test.ts
git commit -m "content: add Bash AI Lab launch entries"
```

### Task 5: Build the global design system, document shell, and locale copy

**Files:**
- Create: `src/styles/global.css`, `src/i18n/en.ts`, `src/i18n/zh.ts`, `src/i18n/index.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/layout/SiteFooter.astro`, `src/components/content/ExternalLink.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces: typed `getUi(locale)`, `BaseLayout` props `{ title, description, lang, canonicalPath, image?, jsonLd? }`, global token classes, and shared footer.
- Consumed by: all route and component tasks.

- [ ] **Step 1: Write failing shell tests**

```ts
// tests/e2e/shell.spec.ts
import { expect, test } from '@playwright/test';

test('loads the English shell with readable tokens', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(/Bash AI Lab/);
  await expect(page.getByRole('contentinfo')).toContainText('Built with Astro');
  const bodySize = await page.locator('body').evaluate((node) => getComputedStyle(node).fontSize);
  expect(Number.parseFloat(bodySize)).toBeGreaterThanOrEqual(15);
});
```

- [ ] **Step 2: Verify failure**

Run: `npm run test:e2e -- tests/e2e/shell.spec.ts`

Expected: FAIL because the base layout and footer are absent.

- [ ] **Step 3: Implement exact tokens and global behavior**

Define CSS custom properties for the approved colors and type scale:

```css
@import "tailwindcss";

:root {
  --color-background: #f5f5f1;
  --color-surface: #ffffff;
  --color-text: #111111;
  --color-text-secondary: #686868;
  --color-border: rgb(0 0 0 / 10%);
  --color-accent: #5b5cff;
  --font-size-3xs: 0.395625rem;
  --font-size-2xs: 0.5275rem;
  --font-size-xs: 0.703125rem;
  --font-size-sm: 0.9375rem;
  --font-size-md: 1.25rem;
  --font-size-lg: 1.665625rem;
  --font-size-xl: 2.220625rem;
  --font-size-2xl: 2.96rem;
  --font-size-3xl: 3.945625rem;
}

[data-theme="dark"] {
  --color-background: #0b0b0c;
  --color-surface: #121214;
  --color-text: #f1f1ee;
  --color-text-secondary: #99999f;
  --color-border: rgb(255 255 255 / 12%);
  --color-accent: #8d8eff;
}

body { min-width: 20rem; background: var(--color-background); color: var(--color-text); font-size: var(--font-size-sm); }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
```

Do not apply `--font-size-3xs`. Restrict `--font-size-2xs` to decorative pseudo-elements with `aria-hidden="true"`.

Import `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` once from BaseLayout. Set `--font-sans: 'Geist Variable', system-ui, sans-serif` and `--font-mono: 'Geist Mono Variable', ui-monospace, monospace`; retain Fontsource's swap behavior so text remains visible while fonts load.

- [ ] **Step 4: Implement locale copy and BaseLayout**

`getUi('en')` exposes all header, footer, CTA, status, and language labels. `getUi('zh')` exposes the Chinese edition-status page and shared navigation labels. BaseLayout sets `lang`, title, description, canonical, social metadata, theme-color, and one pre-render theme script that uses `localStorage.theme` before falling back to `prefers-color-scheme`.

- [ ] **Step 5: Run and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts
npm run check
npm run lint
```

Expected: shell test passes, no type or lint errors.

```bash
git add src/styles src/i18n src/layouts/BaseLayout.astro src/components/layout/SiteFooter.astro src/components/content/ExternalLink.astro src/pages/index.astro tests/e2e/shell.spec.ts
git commit -m "feat: add global design system"
```

### Task 6: Implement accessible navigation, theme switching, and language behavior

**Files:**
- Create: `src/components/navigation/SiteHeader.astro`, `MobileNavigation.astro`, `ThemeToggle.astro`, `LanguageSwitch.astro`
- Create: `tests/e2e/navigation.spec.ts`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: keyboard-safe site shell navigation and persisted theme choice.
- Consumes: `NAV_ITEMS`, `getUi`, `withBase`, and translation availability.

- [ ] **Step 1: Write failing interaction tests**

Test desktop current-page state, mobile menu open/close, Escape close, focus return, theme persistence after reload, system-theme fallback, and language fallback to `/zh/` when no translation exists.

```ts
test('mobile navigation closes on Escape and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const trigger = page.getByRole('button', { name: 'Menu' });
  await trigger.click();
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden();
  await expect(trigger).toBeFocused();
});
```

- [ ] **Step 2: Verify failure**

Run: `npm run test:e2e -- tests/e2e/navigation.spec.ts`

Expected: FAIL because navigation controls do not exist.

- [ ] **Step 3: Implement navigation with native controls**

Use a `<button aria-expanded aria-controls>` disclosure, a labelled `<nav>`, active `aria-current="page"`, Escape handling, focus restoration, and no hidden tabbable links. ThemeToggle updates `document.documentElement.dataset.theme`, `localStorage.theme`, and its accessible label. Header scroll state changes only a data attribute used by CSS.

- [ ] **Step 4: Run checks and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/navigation.spec.ts
npm run check
```

Expected: all keyboard, mobile, theme, and language cases pass.

```bash
git add src/components/navigation src/layouts/BaseLayout.astro tests/e2e/navigation.spec.ts
git commit -m "feat: add accessible site navigation"
```

### Task 7: Build the content-driven homepage

**Files:**
- Create: `src/components/layout/HeroSection.astro`
- Create: `src/components/layout/SectionHeader.astro`
- Create: `src/components/content/ResearchIndex.astro`, `ArticleListItem.astro`, `TagList.astro`
- Create: `src/components/work/ProjectFeature.astro`, `StatusIndicator.astro`, `LabStatus.astro`
- Modify: `src/pages/index.astro`
- Create: `tests/e2e/home.spec.ts`

**Interfaces:**
- Produces: Home sections in the approved order and typographic specimen fallback.
- Consumes: filtered/sorted Work and Research collections, exact typography tokens, `withBase`.

- [ ] **Step 1: Write failing homepage tests**

Assert Hero copy, two CTAs, three research themes, four Lab Status rows sourced from content, at least three selected projects, latest Research ordered by date, no card-grid landmark, and no visible text under 11.25px.

```ts
await expect(page.getByRole('heading', { level: 1 })).toContainText('Building systems that help');
await expect(page.getByRole('region', { name: 'Lab status' }).getByRole('listitem')).toHaveCount(4);
expect(await page.locator('[data-typographic-cover]').count()).toBeGreaterThanOrEqual(3);
```

- [ ] **Step 2: Verify failure**

Run: `npm run test:e2e -- tests/e2e/home.spec.ts`

Expected: FAIL because the content-driven sections are absent.

- [ ] **Step 3: Implement the approved page sequence**

Render Hero, Current Research, Selected Work, Latest Research, Lab Status, and Footer. Hero display clamps from `--font-size-2xl` to `--font-size-3xl`; lead copy uses `--font-size-md`; labels use `--font-size-xs`; body copy uses at least `--font-size-sm`. ProjectFeature alternates media/text alignment and uses semantic rules and whitespace rather than equal-size cards.

- [ ] **Step 4: Run checks and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/home.spec.ts
npm run check
npm run build
```

Expected: homepage tests pass and content changes rebuild without route code edits.

```bash
git add src/components/layout/HeroSection.astro src/components/layout/SectionHeader.astro src/components/content src/components/work src/pages/index.astro tests/e2e/home.spec.ts
git commit -m "feat: build content-driven homepage"
```

### Task 8: Implement Work listing, filters, and project case studies

**Files:**
- Create: `src/pages/work/index.astro`, `src/pages/work/[...slug].astro`
- Create: `src/layouts/ProjectLayout.astro`
- Create: `src/components/work/ProjectListItem.astro`, `ProjectMetadata.astro`, `WorkFilter.astro`
- Create: `src/components/layout/Breadcrumb.astro`, `BackToTop.astro`
- Create: `tests/e2e/work.spec.ts`

**Interfaces:**
- Produces: Work index, progressive category filters, and four static project detail routes.
- Consumes: Work collection schema, typographic fallback, status/tags/external-link components.

- [ ] **Step 1: Write failing Work journey tests**

Test all four projects, category filter behavior with JavaScript, all content remaining accessible without JavaScript, a project route's metadata and case-study headings, and correct GitHub/Demo omission when fields are absent.

- [ ] **Step 2: Verify failure**

Run: `npm run test:e2e -- tests/e2e/work.spec.ts`

Expected: FAIL with 404 for `/work/`.

- [ ] **Step 3: Implement list and static detail generation**

`getStaticPaths()` filters drafts, maps `entry.id` through `contentSlug(entry.id)`, and returns `props: { entry }`. WorkFilter uses real links or buttons with an “All” state, `aria-pressed`, URL query persistence, and a no-script layout that shows all entries. ProjectLayout renders only present optional sections and uses headings from the approved case-study sequence.

- [ ] **Step 4: Run checks and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/work.spec.ts
npm run check
npm run build
```

Expected: four detail pages build and all Work journeys pass.

```bash
git add src/pages/work src/layouts/ProjectLayout.astro src/components/work src/components/layout/Breadcrumb.astro src/components/layout/BackToTop.astro tests/e2e/work.spec.ts
git commit -m "feat: add Work archive and case studies"
```

### Task 9: Implement Research, MDX components, themes, and article details

**Files:**
- Create: `src/pages/research/index.astro`, `src/pages/research/[...slug].astro`
- Create: `src/layouts/ContentLayout.astro`
- Create: `src/components/content/TableOfContents.astro`
- Create: `src/components/mdx/{MDXCallout,MetricBlock,MermaidDiagram,Timeline,QuoteBlock,BeforeAfter}.astro`
- Create: `tests/e2e/research.spec.ts`

**Interfaces:**
- Produces: Research archive, theme landing entries, article pages, accessible MDX primitives.
- Consumes: Research content, reading-time helper, SEO layout, tags, breadcrumb, back-to-top.

- [ ] **Step 1: Write failing Research tests**

Assert archive date/title/category/status/reading-time fields, access to `/research/agentic-development/`, article heading hierarchy, Table of Contents links, Callout semantics, and Mermaid loading only on a page with a diagram.

- [ ] **Step 2: Verify failure**

Run: `npm run test:e2e -- tests/e2e/research.spec.ts`

Expected: FAIL with missing Research routes.

- [ ] **Step 3: Implement archive, detail layout, and MDX map**

ContentLayout accepts `{ entry, headings, minutes }`, renders publication metadata before prose, and passes these exact component names to `render(entry)`:

```ts
const mdxComponents = {
  Callout: MDXCallout,
  Metric: MetricBlock,
  Mermaid: MermaidDiagram,
  Timeline,
  Quote: QuoteBlock,
  BeforeAfter,
};
```

MermaidDiagram dynamically imports `mermaid` only when rendered, uses `securityLevel: 'strict'`, exposes a text fallback, and does not animate when reduced motion is requested.

- [ ] **Step 4: Run checks and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/research.spec.ts
npm run check
npm run build
```

Expected: every Research route and MDX component test passes.

```bash
git add src/pages/research src/layouts/ContentLayout.astro src/components/content/TableOfContents.astro src/components/mdx tests/e2e/research.spec.ts
git commit -m "feat: add Research archive and MDX system"
```

### Task 10: Add Log, About, Resume, Chinese status, and 404 routes

**Files:**
- Create: `src/pages/log/index.astro`, `src/pages/about/index.astro`, `src/pages/resume/index.astro`, `src/pages/zh/index.astro`, `src/pages/404.astro`
- Create: `src/components/content/LogTimeline.astro`
- Create: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Produces: remaining required routes and the bilingual-ready honest fallback.
- Consumes: Pages and Log collections, BaseLayout, locale copy, `withBase`.

- [ ] **Step 1: Write failing route tests**

Test chronological Log entries, six numbered About sections, Resume without invented employers or credentials, Chinese `lang="zh"` and edition-status copy, and 404 home link resolving to `/BashAILabBlog/`.

- [ ] **Step 2: Verify failure**

Run: `npm run test:e2e -- tests/e2e/pages.spec.ts`

Expected: FAIL because routes are missing.

- [ ] **Step 3: Implement content-driven pages**

LogTimeline groups entries by date with real `<time datetime>`. About and Resume render their Pages collection entries. `/zh/` renders only reviewed Chinese interface text explaining that the edition is in preparation. 404 uses the standard shell and a base-path-safe home link.

- [ ] **Step 4: Run checks and commit**

Run:

```bash
npm run test:e2e -- tests/e2e/pages.spec.ts
npm run check
npm run build
```

Expected: all route and bilingual fallback tests pass.

```bash
git add src/pages/log src/pages/about src/pages/resume src/pages/zh src/pages/404.astro src/components/content/LogTimeline.astro tests/e2e/pages.spec.ts
git commit -m "feat: add editorial and bilingual routes"
```

### Task 11: Add SEO, RSS, robots, and structured data with TDD

**Files:**
- Create: `src/lib/seo.ts`, `tests/unit/seo.test.ts`
- Create: `src/pages/rss.xml.ts`, `src/pages/robots.txt.ts`
- Create: `scripts/generate-og.mjs`, `public/images/og/default.png`
- Modify: `src/layouts/BaseLayout.astro`, `ContentLayout.astro`, `ProjectLayout.astro`
- Modify: `astro.config.mjs`, `package.json`

**Interfaces:**
- Produces: `buildCanonical`, `buildPersonJsonLd`, `buildWebsiteJsonLd`, `buildArticleJsonLd`, `buildWorkJsonLd`; RSS and robots endpoints.
- Consumes: `absoluteUrl`, SITE config, filtered content.

- [ ] **Step 1: Write failing SEO tests**

```ts
expect(buildCanonical('/research/', config)).toBe('https://bashxu.github.io/BashAILabBlog/research/');
expect(buildArticleJsonLd(article, config)['@type']).toBe('Article');
expect(buildWorkJsonLd(product, config)['@type']).toBe('SoftwareApplication');
expect(buildWorkJsonLd(infrastructure, config)['@type']).toBe('CreativeWork');
```

Also assert that a page without a real Chinese translation has no `zh` alternate URL.

- [ ] **Step 2: Verify failure**

Run: `npm run test:unit -- tests/unit/seo.test.ts`

Expected: FAIL because `src/lib/seo.ts` does not exist.

- [ ] **Step 3: Implement typed metadata and endpoints**

BaseLayout emits canonical, Open Graph, Twitter Card, Person, and WebSite metadata. ContentLayout emits Article metadata. ProjectLayout selects SoftwareApplication for Products and CreativeWork for Infrastructure/Experiments. RSS includes only non-draft Research and Log items and resolves every link with `absoluteUrl`. Robots points to the base-path-safe Sitemap.

Add `og:generate` to `package.json` and change `build` to `npm run og:generate && astro build`. `scripts/generate-og.mjs` launches the installed Playwright Chromium, renders a 1200×630 Quiet Futurism typographic brand composition, and writes the deterministic `public/images/og/default.png`. An explicit per-entry `seo.image` wins; otherwise layouts use `default.png`. The generator never invents product imagery or metrics.

- [ ] **Step 4: Run checks and commit**

Run:

```bash
npm run test:unit -- tests/unit/seo.test.ts
npm run og:generate
npm run check
npm run build
```

Expected: metadata tests pass; `dist/rss.xml`, `dist/robots.txt`, and Sitemap files exist with `/BashAILabBlog/` URLs.

```bash
git add src/lib/seo.ts tests/unit/seo.test.ts src/pages/rss.xml.ts src/pages/robots.txt.ts src/layouts scripts/generate-og.mjs public/images/og package.json package-lock.json astro.config.mjs
git commit -m "feat: add feeds and structured metadata"
```

### Task 12: Validate production links and configure GitHub Pages deployment

**Files:**
- Create: `scripts/check-links.mjs`, `tests/unit/check-links.test.ts`
- Create: `.github/workflows/deploy.yml`
- Create: `tests/e2e/base-path.spec.ts`

**Interfaces:**
- Produces: deterministic `dist` validation and a least-privilege Pages workflow.
- Consumes: built site, npm scripts, project base configuration.

- [ ] **Step 1: Write failing link-validator tests**

Use temporary HTML fixtures to assert that the validator accepts `/BashAILabBlog/work/`, rejects `/work/`, accepts external URLs, and reports a missing local asset with the source filename.

- [ ] **Step 2: Verify failure**

Run: `npm run test:unit -- tests/unit/check-links.test.ts`

Expected: FAIL because the link-check module is missing.

- [ ] **Step 3: Implement production validation**

The checker walks `dist/**/*.html`, parses `href` and `src`, rejects root-relative internal URLs outside the configured base, maps clean routes to `index.html`, verifies referenced files, and exits nonzero with all broken references listed. Export its pure validation functions for Vitest and keep CLI execution behind an `import.meta.url` guard.

- [ ] **Step 4: Add base-path browser coverage**

Test CSS, favicon, navigation, Work detail, Research detail, RSS, and 404 under the Playwright `/BashAILabBlog/` base URL. Directly requesting `/work/` must not be used anywhere in generated markup.

- [ ] **Step 5: Add the Pages workflow**

Use this job structure:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test
      - run: npm run build
        env:
          PUBLIC_SITE_URL: https://bashxu.github.io
          PUBLIC_BASE_PATH: /BashAILabBlog
      - run: npm run test:links
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 6: Run checks and commit**

Run:

```bash
npm run test:unit -- tests/unit/check-links.test.ts
npm run test:e2e -- tests/e2e/base-path.spec.ts
npm run build
npm run test:links
```

Expected: all base-path cases pass and no broken internal link or asset is reported.

```bash
git add scripts/check-links.mjs tests/unit/check-links.test.ts tests/e2e/base-path.spec.ts .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment gate"
```

### Task 13: Complete accessibility, responsive, performance, and documentation gates

**Files:**
- Create: `tests/e2e/accessibility.spec.ts`, `tests/e2e/responsive.spec.ts`
- Create: `README.md`
- Modify: focused source files only when a failing gate identifies a real defect

**Interfaces:**
- Produces: release evidence and operating documentation.
- Consumes: the completed site and every npm verification command.

- [ ] **Step 1: Add explicit final user-journey tests**

Cover skip-link focus, heading hierarchy, keyboard navigation through all header controls, visible focus, 320px viewport overflow, 768px reading order, 1440px line length, reduced-motion style resolution, light/dark contrast-critical tokens, and back-to-top behavior.

- [ ] **Step 2: Run the new tests before fixes**

Run:

```bash
npm run test:e2e -- tests/e2e/accessibility.spec.ts tests/e2e/responsive.spec.ts
```

Expected: tests either pass or identify concrete selectors/routes to fix; do not weaken assertions to make failures disappear.

- [ ] **Step 3: Fix only evidenced defects and rerun the focused tests**

Make the smallest owning-boundary correction in tokens, layout, or component behavior. Re-run the two files until they pass.

- [ ] **Step 4: Write the complete README**

Document project purpose, stack, Node requirement, local development, content folders, adding Work/Research/Log, editing identity, environment variables, project Pages setup, GitHub Actions source selection, custom domains and optional `CNAME`, themes and tokens, all commands, Chinese content workflow, and troubleshooting for base paths and missing assets.

- [ ] **Step 5: Run the complete release gate**

Run:

```bash
npm ci
npm run format:check
npm run lint
npm run check
npm run test
PUBLIC_SITE_URL=https://bashxu.github.io PUBLIC_BASE_PATH=/BashAILabBlog npm run build
npm run test:links
git diff --check
```

Expected: every command exits 0. Keep `npm run preview -- --host 127.0.0.1 --port 4321` running in a separate terminal, then run Lighthouse against Home, one Work detail, and one Research detail in both desktop and mobile modes:

```bash
npx lighthouse http://127.0.0.1:4321/BashAILabBlog/ --preset=desktop --chrome-flags="--headless" --output=json --output-path=./lighthouse-home-desktop.json
npx lighthouse http://127.0.0.1:4321/BashAILabBlog/ --chrome-flags="--headless" --output=json --output-path=./lighthouse-home-mobile.json
npx lighthouse http://127.0.0.1:4321/BashAILabBlog/work/mac-native-kit/ --preset=desktop --chrome-flags="--headless" --output=json --output-path=./lighthouse-work-desktop.json
npx lighthouse http://127.0.0.1:4321/BashAILabBlog/research/agentic-development/ --preset=desktop --chrome-flags="--headless" --output=json --output-path=./lighthouse-research-desktop.json
```

Record the four category scores for each audit and fix any category below 95 unless the result is caused by the local audit environment and is documented with evidence. Remove generated JSON reports after recording the scores; they are evidence artifacts, not source files.

- [ ] **Step 6: Confirm repository scope and commit**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only Bash AI Lab implementation, tests, workflow, and documentation are changed.

```bash
git add README.md tests src public scripts package.json package-lock.json astro.config.mjs tsconfig.json eslint.config.js .prettierrc.mjs vitest.config.ts playwright.config.ts .github .env.example .gitignore
git commit -m "docs: complete Bash AI Lab release guide"
```

## Completion Evidence

The implementation handoff must report:

- Final route inventory.
- Technical architecture and main file boundaries.
- Exact output of `npm run check`, `npm run lint`, `npm run test`, `npm run build`, and `npm run test:links`.
- Lighthouse scores with audited URLs and viewport modes.
- GitHub Pages repository settings: Settings → Pages → Source → GitHub Actions.
- Default Pages URL and environment values.
- Custom-domain steps without selecting or inventing a domain.
- Honest list of missing real screenshots, project metrics, Email, Resume download, or translations.
