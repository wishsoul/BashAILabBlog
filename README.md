# Bash AI Lab

Bash AI Lab is a static, English-first site for independent software, AI product research, and build logs. It is designed for GitHub Pages project-site deployment at `/BashAILabBlog/`. The Chinese route is intentionally a holding page until reviewed Chinese content and routes are supplied.

## Stack and requirements

- [Astro](https://astro.build/) static output with MDX content collections.
- TypeScript, Tailwind CSS, Geist variable fonts, and Astro sitemap/RSS integrations.
- Vitest for unit tests; Playwright for browser journeys; Lighthouse for local release audits.
- Node.js `>=22.12.0` (see `package.json`). Use the npm version bundled with that Node release.

## Local development

Install dependencies with the lockfile, then run the development server:

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` only when local values need to differ from the checked-in defaults. `.env` files are ignored and must not contain secrets: every `PUBLIC_` value is included in the browser build.

Build and inspect the production output locally:

```bash
PUBLIC_SITE_URL=http://127.0.0.1:4321 PUBLIC_BASE_PATH=/BashAILabBlog npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/BashAILabBlog/` when using that project-site base path.

## Content operations

Content collections, their required fields, and allowed enum values are defined in `src/content.config.ts`. Keep content factual: do not add an outcome, launch status, screenshot, demo, metric, contact method, or translation that has not been supplied and approved.

| Type            | Folder                     | Additions and publication behavior                                                                                                                                                                                                  |
| --------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work            | `src/content/work/en/`     | Add an `.md` or `.mdx` file with the Work schema. Use a unique `translationKey`, `lang: en`, accurate `status`, `category`, `platform`, `role`, `order`, and `draft` state. `featured: true` includes it in the homepage selection. |
| Research        | `src/content/research/en/` | Add an `.mdx` file with `kind: theme` or `kind: article`. A non-draft article needs `publishedAt`; keep it draft until publication is approved.                                                                                     |
| Log             | `src/content/log/en/`      | Add a dated Markdown/MDX entry with `date`, `type`, `summary`, tags, and an accurate `draft` value. The archive sorts entries newest first.                                                                                         |
| Editorial pages | `src/content/pages/en/`    | Edit the approved About or Resume source. The routes resolve the corresponding `en/about` and `en/resume` entries.                                                                                                                  |

After content changes, run `npm run check`, `npm run test`, `npm run build`, and `npm run test:links` before publishing. The content-file tests enforce collection requirements; do not bypass a schema error by inventing a value. The published constraint-system article uses the `ConstraintFlow` MDX component, which accepts an ordered `steps` array and is deliberately static so diagrams do not add a browser runtime dependency.

### Identity and contact details

Edit the site identity, description, GitHub profile, locale defaults, and navigation in `src/config/site.ts`. Edit user-interface copy in `src/i18n/en.ts` and `src/i18n/zh.ts` only when that copy is approved.

`PUBLIC_EMAIL` deliberately defaults to empty. Leave it empty until a verified public address is provided. `PUBLIC_RESUME_PATH` also defaults to empty: without it, the footer links to the editorial Resume page rather than claiming a downloadable file. If a real resume file is supplied, place it under `public/`, set its base-relative path, and run the link checker.

### Chinese content workflow

The live information architecture is English-first. `/zh/` is a Chinese holding page with a return link to English; it is not a translated archive.

Do not publish machine-generated or placeholder translations. When reviewed Chinese material is available, add matching content with `lang: zh` and the same `translationKey`, provide the Chinese UI copy, then implement and test the intended Chinese archive/detail routes and `translationPath` values. Content alone does not enable those routes today because the current Work, Research, Log, About, and Resume routes intentionally render English entries.

## Configuration, themes, and assets

| Variable             | Default                    | Purpose                                                             |
| -------------------- | -------------------------- | ------------------------------------------------------------------- |
| `PUBLIC_SITE_URL`    | `https://bashxu.github.io` | Canonical-origin, sitemap, and feed origin.                         |
| `PUBLIC_BASE_PATH`   | `/BashAILabBlog`           | Deployment subpath used by Astro and base-safe internal URLs.       |
| `PUBLIC_EMAIL`       | empty                      | Optional public email address; an empty value hides the email link. |
| `PUBLIC_RESUME_PATH` | empty                      | Optional base-relative path to a supplied downloadable resume.      |

Theme tokens live in `src/styles/global.css`. The light/dark `--color-background`, `--color-surface`, `--color-text`, `--color-text-secondary`, `--color-border`, and `--color-accent` tokens are the contrast-critical palette. Typography, gutters, page width, and the `--reading-width` measure live beside them. Preserve the reduced-motion media query and validate any token change with the accessibility journeys.

`public/favicon.svg` is the favicon and `public/images/og/default.png` is the generated default social image. They are the only checked-in public assets. The project currently has no supplied real project screenshots, public product metrics, verified public email address, downloadable resume file, or published Chinese translations. The typographic project covers and the default social image are not substitutes for real screenshots.

## Commands

| Command                    | Use                                                                              |
| -------------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`              | Start Astro’s development server.                                                |
| `npm run build`            | Generate the social image and build the static site.                             |
| `npm run preview`          | Serve `dist/` after a build.                                                     |
| `npm run og:generate`      | Regenerate `public/images/og/default.png`.                                       |
| `npm run check`            | Run Astro and TypeScript checks.                                                 |
| `npm run lint`             | Run ESLint.                                                                      |
| `npm run format`           | Apply Prettier formatting.                                                       |
| `npm run format:check`     | Check Prettier formatting without writing files.                                 |
| `npm run test:unit`        | Run Vitest unit tests.                                                           |
| `npm run test:e2e`         | Run Playwright browser tests (the config builds and previews the Pages path).    |
| `npm run test`             | Run unit and E2E suites.                                                         |
| `npm run test:links`       | Validate generated `dist/` links and base-path references.                       |
| `npm run audit:production` | Fail when production dependencies have moderate-or-higher known vulnerabilities. |

The release sequence is:

```bash
npm ci
npm run format:check
npm run lint
npm run check
npm run audit:production
npm run test
PUBLIC_SITE_URL=https://bashxu.github.io PUBLIC_BASE_PATH=/BashAILabBlog npm run build
npm run test:links
git diff --check
```

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys on pushes to `main` (and supports manual dispatch). In the repository, choose **Settings → Pages → Source → GitHub Actions**. Do not select a branch source for this workflow.

For the configured project site, the Pages build environment is:

```text
PUBLIC_SITE_URL=https://bashxu.github.io
PUBLIC_BASE_PATH=/BashAILabBlog
```

The expected Pages URL is `https://bashxu.github.io/BashAILabBlog/`. The deploy job exposes the actual deployment URL in the GitHub Actions environment after a successful run.

### Optional custom domain

No custom domain is selected or configured by this repository. When a domain is actually chosen:

1. In **Settings → Pages**, add and verify that domain, then configure the DNS record GitHub Pages requests.
2. Add `public/CNAME` containing only the chosen domain. Astro copies `public/` into the Pages artifact.
3. Change the Pages build values so `PUBLIC_SITE_URL` is the chosen origin and `PUBLIC_BASE_PATH=/` when the domain serves the site root; update the workflow before deploying.
4. Re-run the release sequence and confirm canonical URLs, the sitemap, RSS, internal links, and the deployed Pages URL.

Do not add a `CNAME`, redirect, or custom-domain URL until the actual domain and DNS ownership are available.

## Troubleshooting

### Pages base paths

For a project site, preserve `PUBLIC_BASE_PATH=/BashAILabBlog` in both the local Pages build and the GitHub Actions build. Internal links and assets must use `withBase` from `src/lib/urls.ts`; do not hand-write root-relative `/work/`, `/research/`, or asset URLs. Run `npm run test:e2e -- tests/e2e/base-path.spec.ts` and `npm run test:links` after changing URL, route, or deployment configuration.

If a preview returns 404, first check that the browser URL includes `/BashAILabBlog/` and that the build used the same base path. Rebuild before running `npm run preview`.

### Missing assets

Place a real supplied asset under `public/`, reference it with the configured base path, and run `npm run build && npm run test:links`. Do not add empty asset paths, invented filenames, or unverified screenshots. For a real resume download, also set `PUBLIC_RESUME_PATH`; otherwise keep the editorial Resume page as the destination.

If `npm run og:generate` fails, ensure Playwright’s Chromium dependency is installed (`npx playwright install chromium`) and rerun the command. The deployment workflow installs Chromium before its test and build stages.
