# Motion and Interaction Design

## Goal

Improve the personal blog's motion and interaction quality without changing its restrained editorial character. Motion must make state changes easier to follow, make controls feel responsive, and add one or two low-frequency brand moments without slowing navigation or reading.

## Design Direction

The approved direction is restrained but branded. The implementation uses progressive enhancement: CSS handles short, frequent feedback; the native View Transitions API handles the two low-frequency transitions that benefit from a stronger spatial story. Browsers without the relevant APIs keep the current immediate behavior.

No animation library or new runtime dependency will be added.

## Architecture

Motion remains local to the component that owns the state:

- `src/styles/global.css` defines shared duration and easing tokens.
- `MobileNavigation.astro` owns menu visibility and its CSS transition.
- `WorkFilter.astro` owns filtered project state, URL persistence, and its optional View Transition.
- `ThemeToggle.astro` owns theme persistence, transition origin, and its optional View Transition.
- `HeroSection.astro` owns the homepage entrance sequence.
- Existing link and arrow components adopt the shared tokens and fine-pointer hover guard without changing their structure.

Functional state is the source of truth. Animation follows a state update and never delays navigation, filtering, focus restoration, theme persistence, or accessible state.

## Motion Tokens

Add these tokens to `:root` in `src/styles/global.css`:

```css
--duration-press: 140ms;
--duration-fast: 160ms;
--duration-enter: 200ms;
--duration-layout: 220ms;
--duration-brand: 260ms;
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

UI motion stays below 300ms. Entering and exiting elements use `--ease-out`; elements moving between two on-screen positions use `--ease-in-out`. Dynamic UI uses transitions or View Transitions rather than restart-prone keyframes. The one exception is the one-time marketing entrance in the homepage hero.

The shared tokens cover values reused across components. One-off timings such as the filter's 120ms exit, 180ms entrance, and the hero's 420ms marketing entrance remain local to their owning component.

## Component Behavior

### Mobile navigation

The menu panel keeps `aria-expanded` and `hidden` as its functional state. Its visual state is enhanced with `@starting-style` and `transition-behavior: allow-discrete`:

- Enter from `opacity: 0` and `translateY(-8px)` to the settled state over 200ms with `--ease-out`.
- Exit to the same edge over 160ms with `--ease-out`.
- Keep the existing plus-to-close indicator morph, but use the shared 160ms token and `--ease-in-out`.
- Preserve Escape handling, breakpoint closing, link-click closing, and focus restoration.

The `hidden` state makes links unavailable to assistive technology immediately. A browser that cannot transition a discrete display change shows or hides the panel immediately.

### Work filter

Filtering keeps the existing `aria-pressed`, `hidden`, query-parameter, `popstate`, and no-JavaScript behavior. On a direct filter-button click, the DOM update runs inside a View Transition when supported:

- Outgoing projects fade over 120ms.
- Projects that remain visible move to their new positions over 220ms with `--ease-in-out`.
- Newly visible projects enter from `opacity: 0` and `translateY(8px)` over 180ms with `--ease-out`.
- Each project receives a stable transition identity derived from its existing content identifier so retained projects move instead of crossfading as unrelated elements.
- Incoming projects do not stagger; filtering must remain fast.

A new filter selection skips any active filter transition before applying the latest selection. Browser back and forward restore filter state immediately without playing another transition. Unsupported browsers execute the existing update directly.

### Theme toggle

The theme toggle keeps the existing theme attribute, accessible label, `localStorage` persistence, and `theme-color` update. When View Transitions are supported and reduced motion is not requested:

- Read the toggle button's center point before changing the theme.
- Store that point in temporary CSS custom properties on the root.
- Apply the theme inside the View Transition update callback.
- Reveal the new root snapshot with a circle expanding from the toggle over 260ms with `--ease-out`.
- Animate the existing disc morph over 180ms with `--ease-in-out`.

A rapid second toggle skips the active theme transition and starts from the current committed theme. Unsupported browsers and reduced-motion users receive the direct theme update.

### Press feedback

The mobile menu trigger, theme toggle, and Work filter buttons receive `scale(0.97)` while active and return over 140ms with `--ease-out`. Navigation links and content cards do not scale.

### Homepage hero

Only the homepage hero receives a page-load entrance. Three visual groups enter in reading order: heading, context, then footer/actions.

- Start each group at `opacity: 0` and `translateY(12px)`.
- Settle over 420ms with `--ease-out`.
- Offset groups by 60ms.
- Never disable pointer interaction while the sequence runs.

The animation does not extend to downstream homepage sections or other routes.

### Existing hover feedback

Existing arrow movement and header color transitions remain. Replace repeated literal durations and curves with the shared tokens. Movement-based hover styles run only inside `@media (hover: hover) and (pointer: fine)` so touch devices do not retain false hover states.

## Accessibility and Reduced Motion

Replace the current blanket 0.01ms duration override with deliberate component-level reduced-motion behavior while retaining `scroll-behavior: auto`:

- Disable View Transitions for theme and filtering.
- Remove translate, scale, and `clip-path` motion.
- Disable press scaling and hover translation.
- Allow only opacity or color transitions up to 160ms where they help state comprehension.
- Keep menu state, focus handling, filter state, theme persistence, and accessible labels identical to the default path.

The reduced-motion implementation is explicit for every component changed by this work. No content begins inaccessible or remains visually hidden if animation does not run.

## Interruptibility and Failure Handling

CSS transitions retarget from their current value when menu state changes quickly. Theme and filter scripts retain their current View Transition and call `skipTransition()` before starting a newer transition of the same kind.

Feature detection occurs before every optional View Transition. If the API is absent or motion is reduced, the state update runs directly. A skipped or rejected visual transition does not roll back the already selected filter or theme. No error message is necessary because failure affects decoration rather than functionality.

No network request, timer-based state machine, or third-party runtime is introduced.

## Testing

Implementation follows test-first development. Tests assert stable outcomes and rapid-interaction behavior instead of sleeping for exact animation durations.

### Automated browser tests

- `tests/e2e/navigation.spec.ts`
  - Rapid mobile-menu toggles end with matching visibility, `aria-expanded`, accessible name, and focus behavior.
  - Rapid theme toggles end with matching root theme, button label, `localStorage`, and `theme-color`.
  - Theme switching still works when View Transitions are unavailable.
- `tests/e2e/work.spec.ts`
  - Rapid category changes leave the URL, `aria-pressed`, and visible projects matching the final input.
  - Back and forward restore the correct filter without stale transition state.
  - Unsupported View Transitions and disabled JavaScript preserve the existing fallback behavior.
- `tests/e2e/accessibility.spec.ts`
  - Reduced motion produces no translate, scale, or `clip-path` animation.
  - Menu, theme, and filter behavior remains complete.
  - Smooth scrolling remains disabled and focus indicators remain visible.
- `tests/e2e/home.spec.ts` and `tests/e2e/responsive.spec.ts`
  - The hero remains present and readable before the entrance finishes.
  - Motion does not alter semantic reading order or create overflow at 320px, 390px, or desktop widths.

### Manual feel checks

- Inspect menu and filter transitions at 4x slow motion for double exposure, incorrect origins, and mismatched property timing.
- Test the theme reveal in light and dark modes, at the top of the page and after scrolling.
- Rapidly repeat menu, filter, and theme actions to confirm transitions do not queue.
- Confirm touch input does not retain hover motion.
- Confirm controls remain usable while their visual transition is still running.

### Release verification

Run the relevant browser tests first, followed by formatting checks, linting, Astro/TypeScript checks, the full test suite, the production build, generated-link validation, and `git diff --check`.

## Success Criteria

- Mobile navigation and Work filtering no longer appear to teleport in supported browsers.
- Theme switching has one short branded reveal without delaying persistence or label updates.
- Buttons provide subtle press feedback and touch devices do not receive sticky hover movement.
- Homepage motion is limited to the hero and does not slow reading or block interaction.
- Rapid interactions always resolve to the user's latest input.
- Reduced-motion users receive no positional, scale, or reveal motion.
- Existing functionality, base-path behavior, localization, keyboard navigation, and no-JavaScript Work content remain intact.
- No animation dependency is added.

## Non-goals

This work does not add global route transitions, scroll-triggered section reveals, card enlargement, parallax, cursor tracking, spring or bounce effects, animated article content, or continuous decorative motion. It does not redesign layout, typography, color, content, or information architecture.
