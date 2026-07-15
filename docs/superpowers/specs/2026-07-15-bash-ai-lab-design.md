# Bash AI Lab Website Design

**Status:** Awaiting written-spec review
**Date:** 2026-07-15
**Repository:** `bashxu/BashAILabBlog`
**Deployment target:** `https://bashxu.github.io/BashAILabBlog/`

## 1. Objective

Bash AI Lab is a personal research and product studio website for an AI Product Manager, Independent Developer, and Agentic Development Researcher. It is not a resume-first portfolio. It presents real products, research, build logs, product architecture, and evidence from one-person AI-assisted software development.

The first release is English-first. The architecture supports Chinese under `/zh/`, but untranslated project and research content is not machine-translated or fabricated. The Chinese entry page clearly states that the Chinese edition is in preparation.

## 2. Success Criteria

The implementation is successful when:

- Astro produces a fully static site with no React or Vue dependency.
- Work, Research, Log, and page content is driven by validated Markdown or MDX collections.
- New content does not require editing core page components.
- The site deploys correctly at the GitHub Pages project subpath `/BashAILabBlog/`.
- Switching to a custom domain requires only site configuration changes and an optional `CNAME`.
- The English site is complete; `/zh/` and the translation model are present without publishing unreviewed translations.
- Light and dark themes, keyboard navigation, reduced motion, responsive layouts, RSS, Sitemap, and page-specific SEO work.
- `npm run check`, `npm run lint`, `npm run test`, and `npm run build` pass.
- Lighthouse Performance, Accessibility, Best Practices, and SEO scores target 95 or higher on representative pages.

## 3. Chosen Approach

Start from the official Astro Minimal scaffold in the current directory and add only the required capabilities. Astro Nano may be inspected for structural ideas such as content handling, SEO, RSS, themes, and restrained animation, but its page UI and portfolio information architecture are not copied.

This approach was chosen over forking Astro Nano or extending a blog template because it minimizes inherited template assumptions and makes GitHub Pages, bilingual routing, content schemas, and the Quiet Futurism visual system explicit from the start.

## 4. Technical Architecture

### 4.1 Runtime and rendering

- Astro with strict TypeScript.
- Static output for every route.
- Astro components by default; no frontend framework integration.
- Small inline or module scripts only for theme switching, mobile navigation, header scroll state, back-to-top behavior, and Mermaid initialization.
- Tailwind through Astro's current official Vite integration, with semantic design tokens defined centrally.

### 4.2 Source boundaries

```text
src/
├── components/
│   ├── content/
│   ├── layout/
│   ├── mdx/
│   ├── navigation/
│   └── work/
├── config/
│   └── site.ts
├── content/
│   ├── log/
│   ├── pages/
│   ├── research/
│   └── work/
├── i18n/
│   ├── en.ts
│   ├── index.ts
│   └── zh.ts
├── layouts/
├── lib/
├── pages/
│   ├── about/
│   ├── log/
│   ├── research/
│   ├── resume/
│   ├── work/
│   └── zh/
└── styles/
```

- `layouts` owns the document shell, metadata, shared article structure, and project structure.
- `components` owns reusable visual and interaction units with focused APIs.
- `content` is the only source for Work, Research, Log, and editorial page data.
- `config/site.ts` owns brand identity, social links, locale settings, and deployment defaults.
- `i18n` owns interface copy; components do not hardcode language-specific strings.
- `lib` contains only pure helpers for URLs, sorting, filtering, translations, reading time, and SEO.
- `styles` owns tokens, global typography, prose rules, themes, focus styles, and motion.

## 5. Routes and Information Architecture

English is the default locale:

```text
/
├── work/
│   ├── mac-native-kit/
│   ├── pastepop/
│   ├── wordgrill/
│   └── tidypilot/
├── research/
│   ├── agentic-development/
│   ├── ai-native-interfaces/
│   └── independent-products/
├── log/
├── about/
├── resume/
└── 404.html
```

Chinese uses `/zh/`. The first release includes `/zh/` as an honest edition-status page and has routing utilities ready for translated routes. A language switch links directly to a translated counterpart only when that content exists; otherwise it links to `/zh/`.

The three required research slugs—`agentic-development`, `ai-native-interfaces`, and `independent-products`—are theme landing entries in the Research namespace. Article details use the same namespace with unique slugs, so every Research URL is content-driven and collision-free.

Primary navigation is Work, Research, Log, About, and GitHub. Resume remains available from About and the footer rather than becoming a primary navigation item.

## 6. Content Collections

Schemas live in `src/content.config.ts` and fail the build on invalid required data.

### 6.1 Shared content fields

- `lang`: `en | zh`
- `translationKey`: stable cross-language identity
- `title`
- `description`
- `draft`
- `tags`
- `publishedAt` or the collection-specific date
- `updatedAt` when applicable
- `seo.title`
- `seo.description`
- `seo.image` when a real image exists

### 6.2 Work

Work includes `slug`, `year`, `startedAt`, `status`, `category`, `featured`, `cover`, `github`, `demo`, `platform`, `role`, and `order`.

Allowed categories are Products, Infrastructure, and Experiments. Allowed statuses are Exploring, Researching, Designing, Building, Testing, Active, Paused, and Shipped.

Initial entries are MacNativeKit, PastePop, WordGrill, and TidyPilot. Their qualitative descriptions and status come from `createsiteprompt.md`. No project metrics, screenshots, or outcomes are invented.

### 6.3 Research

Research includes a category, article status, reading-time input or computed reading time, featured state, and optional related project. Categories are Agentic Development, AI-Native Interfaces, Independent Products, AI Product Management, and Human-AI Collaboration. Article statuses are Note, Essay, Research, Experiment, Framework, and Case Study.

### 6.4 Log

Log entries include `date`, `type`, `summary`, optional `relatedProject`, and tags. Types are Build Log, Research Note, Experiment, Changelog, and Decision.

### 6.5 Pages

Pages support structured About and Resume content without embedding long prose in `.astro` route files.

### 6.6 Draft and translation rules

- A shared production query filters `draft: true` before content reaches pages, RSS, Sitemap, or related-content lists.
- Development may expose drafts only through an explicit local flag.
- A translated entry must share a `translationKey` with its source and use a different `lang`.
- `hreflang` is emitted only for routes that exist.

## 7. Visual System

### 7.1 Direction

The visual language is Quiet Futurism: editorial whitespace, asymmetric but disciplined grids, thin rules, project numbering, status labels, research-index patterns, and restrained motion. It avoids purple gradients, glass-card stacks, AI sparkle motifs, glowing spheres, particle backgrounds, 3D globes, generic skill-tag walls, and dense Bento layouts.

The selected project-cover direction is a typographic specimen. Project identity, category, status, and a concise technical line form the visual when no authentic screenshot or diagram exists. A project may later use a real architecture artifact or screenshot, but the fallback never imitates a product UI or fabricates evidence.

### 7.2 Color tokens

Light theme:

- Background `#F5F5F1`
- Surface `#FFFFFF`
- Primary text `#111111`
- Secondary text `#686868`
- Border `rgba(0, 0, 0, 0.10)`
- Accent `#5B5CFF`

Dark theme:

- Background `#0B0B0C`
- Surface `#121214`
- Primary text `#F1F1EE`
- Secondary text `#99999F`
- Border `rgba(255, 255, 255, 0.12)`
- Accent `#8D8EFF`

The accent appears only on links, focus/current state, small data points, and selected elements.

### 7.3 Typography tokens

The approved modular scale is:

| Token | Size | Use |
| --- | ---: | --- |
| `font-size.3xs` | 6.33px | Defined for completeness but not used in the interface |
| `font-size.2xs` | 8.44px | Nonessential decorative microcopy only |
| `font-size.xs` | 11.25px | Meaningful metadata, captions, labels, and controls |
| `font-size.sm` | 15px | Secondary copy and compact body text |
| `font-size.md` | 20px | Lead copy and standard body emphasis |
| `font-size.lg` | 26.65px | Small headings and editorial list titles |
| `font-size.xl` | 35.53px | Section headings |
| `font-size.2xl` | 47.36px | Page and project titles |
| `font-size.3xl` | 63.13px | Display headings |

Meaningful visible text never falls below 11.25px. Body copy starts at 15px. The Hero display clamps between 47.36px and 63.13px depending on viewport size. Line-height and measure remain generous enough for reading, and narrow screens preserve hierarchy without compressing text into illegibility.

The primary font is a publicly loadable or system-compatible sans-serif with Geist as the preferred choice. Metadata uses a compatible mono face such as Geist Mono. Font loading must not block text rendering.

### 7.4 Motion and interaction

- Short fade/translate entry sequences.
- Small link-arrow movement.
- Restrained project-image scale where authentic images exist.
- Header border or blur after scrolling.
- Clear focus-visible styles.
- `prefers-reduced-motion` removes nonessential animation and smooth scrolling.

## 8. Page Design

### 8.1 Shared shell

The fixed header is visually quiet before scrolling and gains a subtle border or background separation afterward. Desktop navigation is inline. Mobile navigation uses an accessible disclosure pattern, preserves focus, closes on Escape, and prevents hidden links from receiving focus.

The footer includes the brand summary, GitHub, optional configured Email, Resume, RSS, current year, and Built with Astro. Missing optional links are omitted rather than rendered as placeholders.

### 8.2 Home

The homepage sequence is:

1. Hero covering roughly 75–90% of the initial viewport.
2. Current Research as a numbered editorial index.
3. Selected Work with alternating asymmetric layouts and typographic specimen visuals.
4. Latest Research as a date-led publication list.
5. Lab Status generated from Work content.
6. Footer.

### 8.3 Work and project details

Work uses an editorial list with large visual moments, numbering, status, and accessible category filters. Filtering is progressively enhanced; all items remain available without JavaScript.

Project detail pages include Hero, metadata, Problem, Insight, Product Strategy, Solution, AI or Technical Approach, My Role, Artifacts, Results, Learnings, and Next Step. Empty optional sections are omitted. MDX supports authentic images, videos, Mermaid, code, quotes, callouts, metrics, timelines, before/after comparisons, and external links.

### 8.4 Research, Log, About, Resume, and 404

- Research uses a publication/archive list and does not require cover images.
- Log uses a date stream or timeline, not blog cards.
- About uses the numbered sections Background, Current Focus, How I Work, Principles, Selected Experience, and Contact.
- Resume is a concise web document and may link to a real downloadable file when one is supplied.
- 404 preserves the site shell and always provides a base-path-safe way back home.

## 9. Component Boundaries

The initial component set is:

- `SiteHeader`, `MobileNavigation`, `SiteFooter`, `ThemeToggle`
- `HeroSection`, `SectionHeader`, `Breadcrumb`, `BackToTop`
- `ResearchIndex`, `ArticleListItem`, `LogTimeline`
- `ProjectFeature`, `ProjectListItem`, `ProjectMetadata`, `LabStatus`, `StatusIndicator`
- `TagList`, `ExternalLink`, `TableOfContents`
- `MDXCallout`, `MetricBlock`, plus scoped MDX renderers for Mermaid, Timeline, Quote, and Before/After

Components remain focused and are not wrapped in generic abstraction layers unless at least two concrete consumers require the shared behavior.

## 10. URL, SEO, and GitHub Pages

### 10.1 Configuration

Default environment values are documented as:

```dotenv
PUBLIC_SITE_URL=https://bashxu.github.io
PUBLIC_BASE_PATH=/BashAILabBlog
```

For a custom domain, `PUBLIC_SITE_URL` becomes the full domain and `PUBLIC_BASE_PATH` becomes empty. `public/CNAME` is added only when a real domain is selected.

All internal links, assets, canonical URLs, feed links, structured-data URLs, and 404 navigation use one tested URL helper. Route components do not hardcode root-relative paths.

### 10.2 Metadata

The site provides:

- Per-page title and description
- Canonical URLs
- Open Graph and Twitter Card metadata
- Sitemap and `robots.txt`
- RSS for published Research and Log content
- JSON-LD for Person and WebSite globally
- JSON-LD Article for Research
- JSON-LD SoftwareApplication or CreativeWork for Work, selected by project type
- Configurable page-specific social images with a typographic fallback

### 10.3 Deployment workflow

`.github/workflows/deploy.yml` runs on pushes to `main` and `workflow_dispatch`. It grants only `contents: read`, `pages: write`, and `id-token: write`, and uses Pages concurrency to avoid overlapping deploys.

The build job installs Node, runs `npm ci`, `npm run check`, `npm run lint`, `npm run test`, and `npm run build`, performs the base-path link check, and uploads the Pages artifact. The deploy job uses the official GitHub Pages deployment action.

## 11. Error Handling and Honest Fallbacks

- Invalid required content fails the build with a schema error.
- Missing optional GitHub, Demo, Email, image, or download fields hide the corresponding UI.
- Missing real project media uses the approved typographic specimen.
- Broken internal references fail the link-check step.
- Unknown project status, category, locale, or article status fails validation.
- Missing translations never fall back to machine-generated text; the user reaches the Chinese edition-status page.
- Theme controls work without stored preferences and respect the operating-system preference before a user choice exists.

## 12. Quality Strategy

### 12.1 Scripts

`package.json` exposes `dev`, `build`, `preview`, `check`, `lint`, `format`, and `test`. Formatting has a separate check mode for CI. `test` is the deterministic composite gate for Vitest and Playwright; narrower `test:unit` and `test:e2e` scripts remain available during development.

### 12.2 Automated checks

- Astro Check and strict TypeScript.
- ESLint and Prettier with Astro support.
- Vitest for URL/base-path helpers, content sorting, draft filtering, language pairing, reading time, and SEO values.
- Playwright smoke tests for Home, Work, Research, a project detail, 404, theme switching, mobile navigation, keyboard access, and GitHub Pages base-path assets.
- An internal-link checker against the production `dist` output.
- Representative Lighthouse and accessibility checks for Home, Work detail, and Research detail.

Mermaid loads only on documents that contain a diagram. Reduced-motion behavior and keyboard operation are explicit test cases.

## 13. Delivery Phases and Gates

### Phase 1: Foundation

Create the Astro project, strict TypeScript, Tailwind, content configuration, fonts, design tokens, base-path configuration, deployment workflow, and base layout. Run install, check, lint, unit tests, and build.

### Phase 2: Core pages

Build the shared shell, Home, Work, Work detail, Research, Research detail, Log, About, Resume, Chinese edition-status page, and 404. Run component-level checks and Playwright smoke tests.

### Phase 3: Content and metadata

Add initial Work, Research, and Log entries, MDX components, RSS, Sitemap, robots, social metadata, and JSON-LD. Run schema, feed, link, and build validation.

### Phase 4: Quality and deployment readiness

Run the full command suite, responsive checks, keyboard and reduced-motion checks, base-path validation, and Lighthouse. Fix failures before reporting completion.

## 14. Planned File Changes

### Add

- Astro scaffold and npm lockfile
- `src/content.config.ts`
- `src/config/site.ts`
- `src/i18n/*`
- `src/lib/*`
- `src/styles/*`
- Layouts, components, routes, and initial Markdown or MDX content described above
- `public/robots.txt` and real supplied assets only
- `.github/workflows/deploy.yml`
- Vitest and Playwright configuration and tests
- `.env.example`
- `README.md`

### Modify

- Scaffold-generated Astro, TypeScript, package, and styling configuration
- Scaffold-generated homepage and global styles, replacing all template content

### Retain

- `createsiteprompt.md` as the original product and implementation brief
- This approved design document

### Delete

- Only unused example files produced by the selected Astro scaffold. No existing user-authored file is deleted.

## 15. Explicit Non-Goals for the First Release

- Publishing unreviewed Chinese translations
- Inventing project screenshots, metrics, testimonials, or outcomes
- Adding a CMS, database, authentication, comments, search, commerce, analytics, or contact form
- Adding React, Vue, large animation frameworks, 3D scenes, particle effects, or decorative AI imagery
- Binding a custom domain before the owner selects and configures one
