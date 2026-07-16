# Translation Pair Validation Design

## Goal

Block a GitHub Pages deployment when Chinese content cannot be paired with exactly one English source by `translationKey`, or when a language repeats a key.

## Scope

The check covers every content collection under `src/content`: `work`, `research`, `log`, and `pages`. English-only content remains valid. A Chinese entry requires exactly one English entry with the same `translationKey`.

## Design

Add a Node-based validator at `scripts/check-translation-pairs.mjs`. It will recursively read Markdown and MDX content files, obtain `lang` and `translationKey` from each file's front matter, and group entries by key.

For each key, validation fails when either language has more than one entry. It also fails when a Chinese entry has no English counterpart. The validator will print each offending file path and key so the author can correct the content directly.

Expose the validator through `npm run test:translations` and run that command explicitly in `.github/workflows/deploy.yml`. A failed validation stops the build job before a Pages artifact is uploaded.

## Testing

Unit tests will prove the validator accepts one English source with an optional single Chinese translation, and rejects a Chinese entry without English, duplicated English keys, and duplicated Chinese keys. The unit tests will be written and observed failing before the validator implementation is added.

## Non-goals

The check does not compare prose, dates, titles, slugs, or publication states. It validates only the structural translation pairing contract. It does not require an English entry to have a Chinese translation.
