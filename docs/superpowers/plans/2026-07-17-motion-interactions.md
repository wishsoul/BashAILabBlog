# Restrained Blog Motion Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the blog purposeful, branded feedback for navigation, filtering, theme changes, and the homepage hero while preserving content hierarchy, accessibility, and no-JavaScript behavior.

**Architecture:** Keep the existing Astro components and native browser APIs. Define a small shared motion-token layer in the global stylesheet; use component-scoped CSS for local interactions; use native View Transitions only as progressive enhancement for direct theme and work-filter actions. Existing semantic state (`hidden`, `aria-expanded`, `aria-pressed`, history, localStorage) remains authoritative, so unsupported browsers and reduced-motion users retain the current functional flow.

**Tech Stack:** Astro 7, TypeScript, scoped CSS, native View Transitions API, Playwright, ESLint, Prettier.

## Global Constraints

- Do not add Motion, GSAP, or another animation dependency.
- Preserve URL/history behavior, keyboard behavior, focus restoration, ARIA attributes, and the no-JavaScript Work archive.
- Use only opacity, small `translateY`, `scale(.97)`, and the approved theme-reveal clip path; do not add route transitions, scroll reveals, parallax, spring/bounce easing, card enlargement, or continuous loops.
- Use the shared duration/easing variables below rather than new literal timing values.
- In `prefers-reduced-motion: reduce`, skip View Transitions, translations, scale, and clip-path. Keep only short opacity/color feedback (at most 160ms) where useful, and restore instant scroll behavior.

## File Map

- `src/styles/global.css` — shared motion tokens; remove blanket reduced-motion duration override.
- `src/components/navigation/MobileNavigation.astro` — menu panel discrete open/close transition, trigger press feedback, reduced-motion override.
- `src/components/navigation/ThemeToggle.astro` — button press feedback and optional center-origin View Transition theme reveal.
- `src/components/work/WorkFilter.astro` — filter press feedback and progressive-enhancement View Transition coordination.
- `src/components/work/ProjectListItem.astro` — stable transition identity for a project item plus tokenized, pointer-gated arrow hover.
- `src/components/layout/HeroSection.astro` — three homepage-only entrance groups and tokenized action hover.
- `src/components/navigation/SiteHeader.astro`, `src/components/content/ExternalLink.astro`, `src/components/content/ResearchIndex.astro`, `src/components/content/ArticleListItem.astro`, `src/components/layout/BackToTop.astro`, `src/components/work/ProjectFeature.astro` — replace existing literal arrow/header timing and gate hover-only transforms.
- `tests/e2e/navigation.spec.ts`, `tests/e2e/work.spec.ts`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/home.spec.ts`, `tests/e2e/responsive.spec.ts` — behavior and reduced-motion coverage.

---

### Task 1: Establish shared motion tokens and safe reduced-motion baseline

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Write the failing reduced-motion baseline contract.** Keep the existing assertion that reduced motion makes `html` scrolling instant, but change the disc assertion to prove the global blanket override is gone: its declared 160ms transition must remain greater than `0.01s` until the component-level rule in Task 3 intentionally replaces it. Do not test View Transitions here; their reduced-motion behavior belongs with the feature that introduces them in Task 3.

- [ ] **Step 2: Run the focused test and confirm it fails for the expected reason.**

  Run: `npx playwright test tests/e2e/accessibility.spec.ts --grep "reduced-motion"`

  Expected: failure because the current global blanket rule forces all transitions to `0.01ms`.

- [ ] **Step 3: Add only the shared token layer.** In `:root` in `src/styles/global.css`, add:

  ```css
  --duration-press: 140ms;
  --duration-fast: 160ms;
  --duration-enter: 200ms;
  --duration-layout: 220ms;
  --duration-brand: 260ms;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  ```

  Replace the existing universal `@media (prefers-reduced-motion: reduce)` block with only:

  ```css
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  ```

  Component tasks below own their exact reduced-motion rules; do not reintroduce a universal duration override.

- [ ] **Step 4: Run the focused test, formatting, and type checks.**

  Run: `npx playwright test tests/e2e/accessibility.spec.ts --grep "reduced-motion" && npm run format:check && npm run check`

  Expected: pass; later component tasks will make their own reduced-motion assertions stricter.

- [ ] **Step 5: Commit the baseline.**

  ```bash
  git add src/styles/global.css tests/e2e/accessibility.spec.ts
  git commit -m "feat: add shared motion tokens"
  ```

### Task 2: Animate the mobile menu without compromising its semantic state

**Files:**
- Modify: `src/components/navigation/MobileNavigation.astro`
- Modify: `tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Extend mobile-navigation coverage first.** Add a Playwright test that clicks the menu trigger repeatedly before the panel settles and asserts the final `aria-expanded`, label, `hidden` state, and unfocusable hidden link are correct. In the same test, assert the panel’s computed transition property includes `display`; that assertion is the expected pre-implementation failure. Extend the reduced-motion test to assert the panel’s computed transform is `none` when opened.

- [ ] **Step 2: Run the focused tests and confirm the new rapid-toggle assertion fails.**

  Run: `npx playwright test tests/e2e/navigation.spec.ts --grep "mobile navigation"`

  Expected: the new motion-state assertion fails before the component exposes the transition-ready styles.

- [ ] **Step 3: Add panel and trigger CSS only; keep `setOpen` as the single state authority.** Inside the existing mobile breakpoint:

  - Add `transform: scale(.97)` press feedback to `.mobile-navigation__trigger` with `var(--duration-press) var(--ease-out)`.
  - Replace the indicator's `160ms ease` with `var(--duration-fast) var(--ease-in-out)`.
  - Make `.mobile-navigation__panel` transition `opacity`, `transform`, and discrete `display`; use `transition-behavior: allow-discrete`.
  - Set its shown state to `opacity: 1; transform: translateY(0)` and its `[hidden]` state to `display: none; opacity: 0; transform: translateY(-0.5rem)`.
  - Use `@starting-style` for the opening state so the first open animates rather than snapping.
  - Add `@media (prefers-reduced-motion: reduce)` within this component: panel transform becomes `none`; allow at most the short opacity transition; trigger has no scale; indicator may keep its 160ms rotation because it communicates the menu state.
  - Gate visual hover color rules behind `@media (hover: hover) and (pointer: fine)`.

  Do not delay `panel.hidden = !open`: the DOM/ARIA state must change synchronously so closing, Escape, breakpoint changes, links, and focus restoration retain today’s behavior.

- [ ] **Step 4: Re-run focused tests.**

  Run: `npx playwright test tests/e2e/navigation.spec.ts --grep "mobile navigation"`

  Expected: rapid toggling ends deterministically and the original Escape/focus behavior remains green.

- [ ] **Step 5: Commit the menu interaction.**

  ```bash
  git add src/components/navigation/MobileNavigation.astro tests/e2e/navigation.spec.ts
  git commit -m "feat: animate mobile navigation state"
  ```

### Task 3: Add interruptible theme reveal and robust filter layout transitions

**Files:**
- Modify: `src/components/navigation/ThemeToggle.astro`
- Modify: `src/components/work/WorkFilter.astro`
- Modify: `src/components/work/ProjectListItem.astro`
- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/work.spec.ts`

- [ ] **Step 1: Add failing interaction tests.**

  In `navigation.spec.ts`, add a rapid double-click test that verifies the last theme wins, its accessible name and `localStorage.theme` agree, and the same test works after deleting `document.startViewTransition` in `page.addInitScript`.

  In `work.spec.ts`, add tests that:

  - click categories rapidly and verify the final button, visible project count, and URL;
  - navigate back and forward after filter changes and verify state updates immediately;
  - assert that every `[data-project-list-item]` has a unique stable `data-project-transition-name`;
  - run filter behavior after deleting `document.startViewTransition`.

- [ ] **Step 2: Run the focused tests and confirm they fail.**

  Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/work.spec.ts --grep "rapid|fallback|back|forward|filter"`

  Expected: no fallback/interruptible transition coordination or per-project transition names exist yet.

- [ ] **Step 3: Implement theme transition progressive enhancement.**

  In `ThemeToggle.astro`:

  - Retain `applyTheme` for root data attribute, meta color, persistence, and accessible labels.
  - Add a `prefers-reduced-motion` media query and one `activeThemeTransition` variable.
  - On a click, calculate the button centre from `getBoundingClientRect()` and save `--theme-transition-x` / `--theme-transition-y` on `document.documentElement`.
  - If reduced motion is requested or `document.startViewTransition` is absent, call `applyTheme(nextTheme, true)` immediately.
  - Otherwise call `activeThemeTransition?.skipTransition()`, set `data-theme-transition="true"`, and call `document.startViewTransition(() => applyTheme(nextTheme, true))`. Clear the data attribute after `transition.finished`, including rejection handling.
  - Add global View Transition pseudo-element rules scoped to `html[data-theme-transition="true"]`: disable the old-root animation, reveal the new root with a circle expanding from the two custom properties for `var(--duration-brand) var(--ease-out)`, and use `var(--duration-fast) var(--ease-in-out)` for the disc. In its reduced-motion media query, do not define a clip-path reveal.
  - Add `.theme-toggle:active { transform: scale(.97); }` with the shared press transition; gate hover color by fine hover; remove transform transition from the disc under reduced motion.

- [ ] **Step 4: Implement Work filter transition progressive enhancement.**

  In `ProjectListItem.astro`, expose a sanitized deterministic identity using the content entry id, for example `data-project-transition-name={`project-${entry.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`}` on the existing `<article>`.

  In `WorkFilter.astro`:

  - At initialization, assign each article's `style.viewTransitionName` from `data-project-transition-name`.
  - Split the current click path into `updateFilter(filter, persist)` (current ARIA/hidden/history operations) and `runFilter(filter, shouldPersist, shouldAnimate)`.
  - Only direct button clicks call `runFilter(..., true, true)`; initial URL hydration and `popstate` call it with `shouldAnimate: false`.
  - If reduced motion is requested, the API is missing, or the requested category is already selected, update synchronously. Otherwise skip any active filter transition, set `data-work-filter-transition="true"` on `html`, and wrap `updateFilter` in `document.startViewTransition`.
  - Clear the root marker when `finished` settles. Keep `pushState` exactly once per user selection; do not push history during `popstate` or initial hydration.
  - Add scoped global pseudo-element rules while that marker is present: old snapshots fade out in 120ms, new snapshots fade and enter from `translateY(0.5rem)` in 180ms with `var(--ease-out)`, and groups use `var(--duration-layout) var(--ease-in-out)` so retained items move. Keep root snapshots unanimated to avoid a full-page flash.
  - Add `scale(.97)` press feedback to filter buttons; gate their hover color rule behind fine-hover media; in reduced motion remove scale/translate and do not start View Transitions.

- [ ] **Step 5: Re-run the focused tests plus no-JavaScript archive coverage.**

  Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/work.spec.ts`

  Expected: pass, including the existing no-JavaScript suite.

- [ ] **Step 6: Commit the progressive enhancements.**

  ```bash
  git add src/components/navigation/ThemeToggle.astro src/components/work/WorkFilter.astro src/components/work/ProjectListItem.astro tests/e2e/navigation.spec.ts tests/e2e/work.spec.ts
  git commit -m "feat: add interruptible theme and filter motion"
  ```

### Task 4: Give the homepage a one-time editorial entrance and normalize hover motion

**Files:**
- Modify: `src/components/layout/HeroSection.astro`
- Modify: `src/components/navigation/SiteHeader.astro`
- Modify: `src/components/content/ExternalLink.astro`
- Modify: `src/components/content/ResearchIndex.astro`
- Modify: `src/components/content/ArticleListItem.astro`
- Modify: `src/components/layout/BackToTop.astro`
- Modify: `src/components/work/ProjectFeature.astro`
- Modify: `src/components/work/ProjectListItem.astro`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Add failing hero tests.** Add homepage assertions that the heading, detail/context, and footer action groups expose `data-hero-motion-group` values in source order. Under reduced motion, assert all three compute to `transform: none`; at 320px assert no horizontal overflow after the hero animation has had a frame to begin.

- [ ] **Step 2: Run the focused tests and confirm they fail because no groups exist.**

  Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts --grep "hero|overflow"`

  Expected: the selector contract is absent.

- [ ] **Step 3: Refactor Hero markup minimally to provide exactly three groups.**

  - Preserve the heading as group `heading`.
  - Wrap the description and focus list in a new `.hero__details` group `context` without changing their order or semantics.
  - Keep the location/actions wrapper as group `footer`.
  - Update grid CSS so `.hero__context` remains the two-column layout, `.hero__details` contributes the existing lead/focus placement, and the footer spans both columns. Preserve the single-column mobile layout.

- [ ] **Step 4: Add the one-time entrance and tokenized hover behavior.**

  - Define a component-local `hero-enter` keyframe from `opacity: 0; transform: translateY(0.75rem)` to settled values.
  - Apply it only to the three motion groups, with `420ms var(--ease-out) both` and delays 0ms, 60ms, and 120ms. It must run solely on document load; do not attach scroll observers or replay logic.
  - Under reduced motion, replace the animation with opacity-only feedback of no more than `var(--duration-fast)` and `transform: none`.
  - Replace literal `160ms ease` in the hero action border and arrow behavior with shared tokens and wrap action hover transforms in `@media (hover: hover) and (pointer: fine)`.
  - For `SiteHeader`, `ExternalLink`, `ResearchIndex`, `ArticleListItem`, `BackToTop`, `ProjectFeature`, and `ProjectListItem`, replace literal timing with `var(--duration-fast) var(--ease-out)` and move transform-only `:hover` rules into the same fine-hover query. Do not change any non-hover keyboard focus or link semantics.

- [ ] **Step 5: Re-run focused tests.**

  Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts`

  Expected: pass; hero content stays readable and no reduced-motion transform leaks.

- [ ] **Step 6: Commit the homepage and hover polish.**

  ```bash
  git add src/components/layout/HeroSection.astro src/components/navigation/SiteHeader.astro src/components/content/ExternalLink.astro src/components/content/ResearchIndex.astro src/components/content/ArticleListItem.astro src/components/layout/BackToTop.astro src/components/work/ProjectFeature.astro src/components/work/ProjectListItem.astro tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts
  git commit -m "feat: polish editorial motion feedback"
  ```

### Task 5: Full verification and visual motion review

**Files:**
- No production source changes expected; amend the relevant prior commit only if a verified defect is found.

- [ ] **Step 1: Run all automated quality gates.**

  Run: `npm run format:check && npm run lint && npm run check && npm run test && npm run build && npm run test:links`

  Expected: all commands exit 0.

- [ ] **Step 2: Perform manual browser checks at normal speed and 4× slow motion.**

  Verify:

  - Mobile menu open/close and rapid toggles; Escape returns focus; link and breakpoint closure are immediate semantically.
  - Theme reveal originates at the pressed toggle, can be interrupted repeatedly, and falls back cleanly when the API is disabled.
  - Work filters fade/layout-shift only for direct clicks; browser Back/Forward has no animation; query URL and no-JavaScript archive remain correct.
  - Homepage hero does not obscure content or delay interaction; desktop and 320px layout remain overflow-free.
  - Reduced motion suppresses transform, scale, clip-path, and View Transition behavior while retaining legible state changes.

- [ ] **Step 3: Inspect the final diff and repository state.**

  Run: `git diff --check && git status --short && git log --oneline -5`

  Expected: no whitespace errors; only the planned implementation commits are staged/committed, and pre-existing untracked `.agents/`, `skills-lock.json`, and `docs/superpowers/plans/2026-07-16-bilingual-chinese-edition.md` remain untouched.

- [ ] **Step 4: Record any defect fix in its own commit.**

  ```bash
  git add <only-the-fixed-files>
  git commit -m "fix: refine motion interaction behavior"
  ```

## Final Acceptance Checklist

- [ ] All interactions retain their current semantic and URL behavior with JavaScript disabled or with View Transitions unavailable.
- [ ] Motion follows the approved durations, easing, and interruption rules.
- [ ] Reduced motion has no transform/clip/scale or universal duration hack.
- [ ] All test, build, and link checks pass.
- [ ] No unrelated untracked user files are included in commits.
