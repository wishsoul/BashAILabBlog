# Long-form Typography System Design

## Goal

Create one reusable long-form reading system for Work, Research, and future editorial pages. The system must improve hierarchy, rhythm, readability, navigation, and technical-media width without redesigning the site's restrained editorial identity or changing article copy.

## Current-state Evidence

The existing implementation has two independent prose systems:

- `ProjectLayout.astro` styles only H2, paragraphs, and a few media elements. Consecutive paragraphs have no spacing, and lists, blockquotes, and other Markdown elements fall back to the 15px body scale.
- `ContentLayout.astro` separately styles H2, H3, paragraphs, lists, and media with slightly different values.
- Both layouts constrain all content to `--reading-width: 36rem`, including code and tables.
- Paragraphs use `--color-text-secondary`; on the Chinese MacNativeKit page this computes to `rgb(104, 104, 104)` against the light background.
- The Chinese MacNativeKit page renders 20px paragraphs at a 33px line height, but lists and blockquotes fall back to 15px at a 24px line height.
- H2 computes to approximately 26.65px at weight 540 and relies on a top border for separation.
- The Work rail contains only the project number and localized “Case study” label even though Astro can generate heading metadata.
- The no-cover specimen hero reaches approximately 688px on the current desktop page.

The OpenAI reference page is used only to validate long-form layout principles: a distinct heading scale, a useful left-side contents rail, a narrow reading column, and wider technical/visual material. Its brand, font, components, and decorative language will not be copied.

## Approved Direction

Add a dedicated `src/styles/prose.css` file and import it from `src/styles/global.css`. Both long-form layouts add the shared `.prose` class to their existing content container and retain their existing test data attributes.

This direction was selected over placing all rules directly in `global.css`, which would make the global file harder to maintain, and over adding a `Prose.astro` wrapper, which would add unnecessary slot and scoped-style complexity.

No new framework, dependency, client-side script, font file, or article-specific table of contents will be introduced.

## Architecture and Responsibilities

### Shared prose layer

`src/styles/prose.css` owns Markdown presentation for:

- H2, H3, and H4 headings;
- paragraphs and adjacent-paragraph rhythm;
- ordered, unordered, and nested lists;
- blockquotes;
- links, strong text, and emphasis;
- inline code and fenced code blocks;
- tables and their semantic sections and cells;
- horizontal rules;
- images, videos, figures, and captions;
- narrow reading width and explicit wide-content breakout.

Selectors use low-specificity `:where()` rules and distinguish ordinary Markdown output from classed MDX components when their layouts differ. Existing MDX components such as callouts, timelines, metrics, and quote figures retain their component-owned structure and styling while inheriting the shared reading color and typographic context where appropriate.

### Project layout

`src/layouts/ProjectLayout.astro` continues to own:

- project identity and hero composition;
- project metadata and actions;
- desktop rail and body grid;
- responsive placement of the contents rail;
- project footer and back-to-top placement.

It removes its duplicate Markdown element rules. Its existing `[data-project-case-study]` container also receives `.prose`.

### Content layout

`src/layouts/ContentLayout.astro` continues to own:

- article title, lead, and publication metadata;
- desktop rail and body grid;
- responsive placement of the contents rail;
- article footer and back-to-top placement.

It removes its duplicate Markdown element rules. Its existing `[data-content-prose]` container also receives `.prose`.

### Heading data flow

All long-form routes use the same static data flow:

```text
Astro content entry
→ render(entry)
→ { Content, headings }
→ ProjectLayout or ContentLayout
→ TableOfContents
```

Both English and Chinese Work detail routes begin extracting `headings` from `render(entry)` and pass them to `ProjectLayout`. Research routes retain their existing heading flow.

## Tokens

Add or update these shared tokens in `src/styles/global.css`:

```css
--color-reading-text: #282826;
--font-cjk:
  "PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif;
--font-size-reading: clamp(1.125rem, 1.08rem + 0.18vw, 1.25rem);
--reading-width: 40rem;
--reading-wide-width: 52rem;
```

The exact dark reading value is `#d8d8d4`, a light neutral between `--color-text` and `--color-text-secondary` that is visually closer to primary text and meets WCAG AA against `--color-background`. Code and table surfaces use the existing `--color-surface`, and their boundaries use `--color-border`; no additional code-surface token is introduced.

No existing font-size token is removed. The reading token describes long-form body text without changing archive, navigation, metadata, or homepage scales.

## Typography

### Body copy

- `.prose` uses `--font-size-reading`, `--color-reading-text`, and a 1.75 line height.
- Chinese prose uses a 1.8 line height.
- Paragraphs reset their margins, while adjacent top-level paragraphs receive approximately `1.4em` of block-start spacing.
- Paragraphs immediately following a heading do not receive extra paragraph-to-paragraph spacing.
- Long-form links retain the existing accent underline language and inherit the reading color.
- Strong and emphasized text retain the body size and line height so emphasis does not create baseline jumps.

### Heading hierarchy

H2 uses:

```css
font-size: clamp(1.875rem, 1.65rem + 0.7vw, 2.25rem);
font-weight: 620;
line-height: 1.2;
letter-spacing: -0.025em;
margin-block: clamp(3.5rem, 7vw, 5rem) 1.25rem;
```

H2 no longer receives a border above every section. The first top-level H2 has no large leading gap.

H3 uses:

```css
font-size: clamp(1.4rem, 1.3rem + 0.35vw, 1.65rem);
font-weight: 600;
line-height: 1.3;
margin-block: 2.75rem 1rem;
```

H4 uses `clamp(1.125rem, 1.05rem + 0.25vw, 1.35rem)`, a 620 weight, a 1.4 line height, and `2rem 0 0.75rem` block margins. This creates a smaller but explicit step above body copy without relying on color alone.

H2, H3, and H4 receive a `scroll-margin-top` based on `--site-header-height` plus additional breathing room so in-page links are not hidden beneath the fixed header.

### Lists

- Ordinary Markdown `ul` and `ol` inherit the prose size, reading color, and line height.
- Top-level lists use approximately `1.4em 0 1.8em` block margins and `1.35em` inline-start padding.
- Adjacent list items use approximately `0.5em` separation.
- Nested lists use smaller block margins so nested content remains grouped.
- Classed component lists such as the timeline and constraint flow keep their specialized layout and list-marker rules.

### Quotes

Ordinary Markdown blockquotes use a thin accent-colored inline-start border, restrained padding, and the primary reading color. They do not add oversized quotation marks. Paragraphs inside a blockquote use the prose scale and rhythm.

The `QuoteBlock` MDX component remains a text-width figure and is not treated as wide visual media.

### Code

Inline code uses Geist Mono at `0.88em`, with `--color-surface`, a `1px` border, a `0.2rem` radius, and `0.08em 0.3em` padding. It must remain visually subordinate to surrounding Chinese text.

Code blocks use Geist Mono at `clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem)`, a 1.6 line height, `1.25rem` padding, a `0.35rem` radius, and `white-space: pre`. They scroll horizontally instead of wrapping long source lines. Light and dark themes both maintain readable foreground/background contrast.

### Tables

Tables use the existing border token, a 620 header weight, `--color-surface` for header cells, `0.7rem 0.85rem` cell padding, and the prose reading color. A table uses `display: block` and `overflow-x: auto` so it becomes its own horizontal scroll container when its intrinsic width exceeds the available wide-content width. The page itself must not gain horizontal overflow.

### Figures and captions

Default images and videos remain constrained to the text column. Every direct-child figure except `.quote-block`, architecture diagrams, and explicitly marked `.prose-wide` content use the wide-content breakout. Captions use a smaller secondary scale but remain readable in both themes.

## Narrow Text and Wide Media

The `.prose` container remains `width: min(100%, var(--reading-width))` and acts as a single-column grid so selected direct children can be centered beyond the 40rem text track without fragile negative-margin calculations.

The following may expand to `min(var(--reading-wide-width), calc(100vw - 2 * var(--page-gutter)))`:

- fenced code blocks;
- tables;
- visual figures;
- architecture diagrams;
- elements explicitly marked `.prose-wide`.

The wide limit is 52rem on sufficiently large screens and naturally collapses to the available gutter-safe width on narrow screens. The body and root document must never acquire horizontal overflow. A code block or table with overlong content scrolls internally.

The existing `ConstraintFlow` output receives explicit wide-media semantics. `QuoteBlock` remains narrow. A standalone Markdown image does not become wide merely because it is an image.

## Table of Contents

`src/components/content/TableOfContents.astro` continues to filter generated headings to depths 2 and 3.

- Each H2 displays a two-digit visual index such as `01` or `02`.
- H3 entries appear indented beneath their surrounding H2 context.
- Links use Astro-generated heading slugs and require no base-path rewriting because they are same-document fragments.
- The navigation retains `<nav>` and its localized accessible label.
- English displays “On this page”.
- Chinese displays “本页目录”.
- The table of contents remains visually auxiliary and does not compete with article headings.
- Focus-visible behavior is retained.
- No scroll-position tracking or active-section JavaScript is added.

Each layout computes whether it has any H2/H3 entries before rendering the rail. When there are no eligible headings, the `<aside>` is omitted, the obsolete project-number/case-study fallback does not return, and the prose is centered in a single-column body layout.

## Project Hero

The shared border, background, project number, title, diagonal line, and circle remain intact.

- A no-cover `.project-hero-specimen` uses `min-height: clamp(20rem, 36vw, 30rem)` at all breakpoints and retains its existing responsive internal padding and overflow protection.
- A real `.project-layout__image` retains the existing cover-oriented minimum-height behavior so genuine artwork is not compressed into the specimen scale.

## Chinese Typography

English pages continue to use Geist as their primary sans-serif family. Chinese pages use the shared CJK stack for body copy and headings:

```css
"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif
```

Code always uses Geist Mono. No new font files are downloaded or committed.

Chinese `.meta-label` text uses the CJK stack, `letter-spacing: 0.04em`, and `text-transform: none`. English metadata retains Geist Mono and uppercase treatment. On Chinese pages, Project and Content H1 letter spacing is `-0.035em` instead of the current Latin-oriented `-0.07em`; prose H2–H4 use the shared heading values above. Mixed Latin product names remain intact as text and receive only the less aggressive Chinese-page spacing.

## Responsive Behavior

The directory/body grid remains sticky only where both the rail and a 40rem reading column fit comfortably.

- At large desktop widths, the rail is sticky and separated from the reading column by a clear gap.
- At approximately 64rem and below, the rail becomes static above the prose and the body becomes one column.
- At 768px and 390px, the prose, list padding, code blocks, tables, and wide figures remain within page gutters.
- H1 keeps the existing responsive scale and wrapping behavior; Chinese Project and Content pages use the approved `-0.035em` letter spacing.
- H2 remains within its 30–36px clamp and does not dominate mobile screens.

The required viewports are 1440×900, 1280×800, 1024×768, 768×1024, and 390×844.

## Accessibility

- Light and dark reading tokens must meet WCAG AA contrast against their backgrounds.
- Heading levels come directly from Markdown and are not rewritten.
- The contents rail uses semantic navigation and localized accessible labels.
- In-page targets remain visible below the fixed header.
- Existing `:focus-visible` and `prefers-reduced-motion` rules remain unchanged.
- Hierarchy is expressed with size, weight, and spacing rather than color alone.
- At 200% zoom, prose and the static contents rail remain readable without page-level horizontal scrolling.

## Testing Strategy

Implementation follows a red-green-refactor cycle. Browser tests are added or updated before production styles and layout code.

### Work behavior

`tests/e2e/work.spec.ts` verifies:

- the English and Chinese MacNativeKit pages expose the shared `.prose` container;
- the MacNativeKit page has an automatically generated table of contents;
- the directory contains multiple H2 links in document order;
- the Chinese directory displays “本页目录” and the English directory displays “On this page”;
- every tested contents link has a matching heading target;
- paragraph spacing is visible in computed layout;
- list items inherit the prose size, color, and line height;
- the no-cover specimen hero falls within the approved height range.

### Research behavior

`tests/e2e/research.spec.ts` verifies:

- Research detail pages expose the same `.prose` class;
- the existing generated contents links and callout behavior remain intact;
- heading targets receive sufficient scroll offset;
- custom MDX components retain their intended component layout.

### Responsive and wide-content behavior

`tests/e2e/responsive.spec.ts` verifies:

- the prose column is approximately 40rem at 1440px;
- the rail is sticky on desktop and static at the tablet breakpoint;
- the 390px Work detail page has no document-level horizontal overflow;
- code blocks use internal horizontal scrolling without forced line wrapping;
- tables use internal horizontal scrolling without widening the document;
- wide content exceeds the text column when space permits and collapses to the gutter-safe width on mobile.

Because no current article contains a Markdown table, the table test injects DOM equivalent to Astro’s rendered Markdown output into the live `.prose` container and inspects actual computed layout and scrolling. It does not inspect CSS source strings and does not modify article content.

### Theme behavior

Existing theme tests remain. Long-form tests additionally verify that the computed prose color matches the active `--color-reading-text`, that code surfaces remain distinct, and that foreground/background contrast meets the approved threshold in both light and dark themes.

## Visual Verification and Artifacts

After the production build, capture full-page screenshots of `/zh/work/mac-native-kit/` at:

- 1440×900;
- 390×844.

Store the generated screenshots in a clearly named local artifact directory and report their absolute paths. Inspect both images rather than treating test success as visual approval. Also inspect 1280×800, 1024×768, and 768×1024 interactively for directory placement, H1/H2 wrapping, list gutters, and overflow.

The visual review checks:

- reading text no longer appears secondary-gray;
- adjacent paragraphs have a visible but restrained gap;
- lists no longer shrink to the site body scale;
- H2 hierarchy is clear without repeated rules;
- chapter spacing is not excessive;
- the no-cover hero no longer consumes nearly a full screen;
- the directory is useful and legible;
- technical media uses the wide column appropriately;
- Chinese typography feels natural in both themes.

## Release Verification

Run the following commands after implementation:

```bash
npm ci
npm run format:check
npm run lint
npm run check
npm run test
PUBLIC_SITE_URL=https://wishsoul.github.io PUBLIC_BASE_PATH=/BashAILabBlog npm run build
npm run test:links
git diff --check
```

If `format:check` fails because of this work, run `npm run format` and repeat the complete verification sequence.

## Expected File Scope

The implementation is expected to modify or create only files directly tied to the approved system:

- `src/styles/global.css`;
- `src/styles/prose.css`;
- `src/layouts/ProjectLayout.astro`;
- `src/layouts/ContentLayout.astro`;
- `src/components/content/TableOfContents.astro`;
- `src/components/mdx/ConstraintFlow.astro` to add explicit wide semantics;
- `src/i18n/zh.ts`;
- `src/pages/work/[...slug].astro`;
- `src/pages/zh/work/[...slug].astro`;
- relevant Work, Research, responsive, and accessibility E2E tests.

Existing unrelated untracked files and unfinished work remain untouched.

## Success Criteria

- Work and Research reuse one shared `.prose` system.
- Long-form body copy is approximately 18–20px, uses the reading token, and has consistent line height across paragraphs, lists, quotes, and inline elements.
- H2 and H3 form an unmistakable hierarchy without a divider above every H2.
- Consecutive paragraphs have deliberate spacing.
- The normal reading column is approximately 640px on desktop.
- Code, tables, and visual figures can use up to approximately 832px without creating document overflow.
- Work pages receive an automatically generated, localized, accessible H2/H3 directory.
- Empty directories are omitted with no fallback case-study rail.
- Chinese pages use an explicit CJK stack and natural metadata casing and spacing.
- The no-cover project hero has materially lower visual weight.
- Required automated checks, production build, link validation, and visual review complete with recorded results.

## Non-goals

This work does not redesign the whole blog, copy OpenAI branding, alter article copy, add scroll-linked directory highlighting, add a new frontend dependency, download fonts, change content schemas, change route semantics, remove the existing theme system, or replace the site’s editorial visual language.
