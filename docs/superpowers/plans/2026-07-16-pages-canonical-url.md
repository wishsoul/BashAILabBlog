# Pages Canonical URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the project through the public `wishsoul/BashAILabBlog` repository with canonical URLs that match its GitHub Pages host.

**Architecture:** Keep the GitHub Pages project-site path `/BashAILabBlog` unchanged. Replace only the deployed origin default in Astro, site metadata, the example environment, and the deploy workflow; protect their alignment with one file-backed unit test. Enable Pages in Actions mode, push the verified `main` branch, and verify the deployment run.

**Tech Stack:** Astro 7 static output, Vitest 4, GitHub Actions Pages, GitHub CLI.

## Global Constraints

- The public repository is `wishsoul/BashAILabBlog` on branch `main`.
- Canonical origin is exactly `https://wishsoul.github.io`.
- The project-site base path remains exactly `/BashAILabBlog`.
- Do not change `SITE.github`; it is the independent Bash profile link, not the deployment host.
- Do not force-push or overwrite remote history.
- Commit the configuration task before merging and publishing.

---

### Task 1: Align the Pages deployment origin

**Files:**
- Create: `tests/unit/pages-deployment-config.test.ts`
- Modify: `.env.example:2`
- Modify: `astro.config.mjs:11`
- Modify: `src/config/site.ts:8`
- Modify: `.github/workflows/deploy.yml:31`
- Modify: `README.md:61-117`

**Interfaces:**
- Consumes: `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` environment variables.
- Produces: a static build whose canonical URLs, sitemap, RSS, and Pages deployment all use `https://wishsoul.github.io/BashAILabBlog/`.

- [x] **Step 1: Write the failing configuration test**

```ts
expect(await readProjectFile("astro.config.mjs")).toContain(
  '"https://wishsoul.github.io"',
);
expect(await readProjectFile(".github/workflows/deploy.yml")).toContain(
  "PUBLIC_SITE_URL: https://wishsoul.github.io",
);
```

- [x] **Step 2: Run the focused test to verify it fails**

Run: `npm run test:unit -- tests/unit/pages-deployment-config.test.ts`

Expected: FAIL because the tracked default is `https://bashxu.github.io`.

- [x] **Step 3: Make the minimal configuration and documentation change**

```text
PUBLIC_SITE_URL=https://wishsoul.github.io
PUBLIC_BASE_PATH=/BashAILabBlog
```

Apply the same origin to the Astro default, `SITE.siteUrl`, workflow environment, and current README operational instructions.

- [x] **Step 4: Verify the focused test passes**

Run: `npm run test:unit -- tests/unit/pages-deployment-config.test.ts`

Expected: PASS with all configuration sources aligned.

- [x] **Step 5: Verify the full release gate**

Run: `npm run format:check && npm run lint && npm run check && npm test && npm run audit:production && PUBLIC_SITE_URL=https://wishsoul.github.io PUBLIC_BASE_PATH=/BashAILabBlog npm run build && npm run test:links && git diff --check`

Expected: all commands exit 0; `astro check` reports 0 errors, 0 warnings, and 0 hints.

- [x] **Step 6: Commit**

```bash
git add .env.example astro.config.mjs src/config/site.ts .github/workflows/deploy.yml README.md tests/unit/pages-deployment-config.test.ts docs/superpowers/plans/2026-07-16-pages-canonical-url.md
git commit -m "fix: align Pages canonical URL"
```

### Task 2: Publish through GitHub Pages

**Files:**
- Modify: none after Task 1 commit

**Interfaces:**
- Consumes: verified `main` branch and `.github/workflows/deploy.yml`.
- Produces: a GitHub Pages deployment for `https://wishsoul.github.io/BashAILabBlog/`.

- [ ] **Step 1: Merge the verified commit into `main`**

Run: `git -C /Users/bashxu/Documents/GitHub/BashAILabBlog merge --ff-only fix/pages-canonical-url`

Expected: fast-forward merge with no conflict.

- [ ] **Step 2: Push `main` without rewriting remote history**

Run: `git push origin main`

Expected: push succeeds and GitHub Actions is triggered by the `main` push.

- [ ] **Step 3: Enable Pages in GitHub Actions mode**

Run: `gh api --method POST repos/wishsoul/BashAILabBlog/pages -f build_type=workflow`

Expected: GitHub returns Pages configuration, or reports that the site is already configured.

- [ ] **Step 4: Verify the deployment run and public URL**

Run: `gh run list --repo wishsoul/BashAILabBlog --workflow deploy.yml --limit 1` followed by `gh run watch <run-id> --repo wishsoul/BashAILabBlog --exit-status` and `curl --fail --head https://wishsoul.github.io/BashAILabBlog/`.

Expected: workflow succeeds and the public URL returns HTTP 200.
