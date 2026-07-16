# Warning Remediation Implementation Plan

> **For implementation:** Follow this plan in the isolated `fix/warning-remediation` worktree. Commit the completed remediation as one focused Git commit, then verify the complete quality gate before integration.

## Objective

Resolve the two non-blocking build hints without masking them: migrate deprecated Zod URL validation, remove the only client-side Mermaid payload by rendering the published constraint flow statically, and add a production-dependency audit gate.

## Constraints

- Preserve the published flow's label, step order, and readable fallback.
- Do not raise the chunk-size threshold or suppress warnings.
- Do not downgrade Lighthouse or run a forced audit fix to hide dev-only findings.
- Follow red-green verification before changing production code.
- Commit this self-contained task after all checks pass.

## Steps

1. Add failing focused checks for the static flow render, the Zod v4 API migration, and the production audit command.
2. Replace the Mermaid MDX component with an accessible static constraint-flow component, remove the unused package, and migrate Zod URL validators.
3. Add the production audit script to the deployment workflow and document the command.
4. Run formatting, linting, type/content checks, unit and browser tests, production audit, full production build, link validation, and diff checks.
5. Review the diff and commit the verified remediation.
