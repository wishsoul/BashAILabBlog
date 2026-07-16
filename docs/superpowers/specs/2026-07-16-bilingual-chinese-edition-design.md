# Bilingual Chinese Edition Design

## Goal

Publish a complete Chinese edition of the site, preserving the English edition and connecting each available translation through `translationKey`.

## Scope

The Chinese edition will include the home page, Work archive and detail pages, Research archive and detail pages, Log archive, About page, and Resume page. It will translate every currently English content entry: four Work entries, eight Research entries, three Log entries, About, and Resume. The existing Chinese MacNativeKit Work entry remains the translation for its English counterpart.

The global GitHub profile link in the desktop header, mobile navigation, and footer will change to `https://github.com/wishsoul`. Project-specific repository URLs remain unchanged.

## Routes and Content Pairing

English routes remain unchanged. Chinese equivalents use the `/zh/` prefix, such as `/zh/work/` and `/zh/work/mac-native-kit/`. The two language versions of an entry use the same filename slug and `translationKey`, but their `lang`, text, SEO title, and SEO description are localized.

A shared lookup based on `translationKey` will supply the counterpart URL to the language switcher. This gives detail pages a direct language-to-language link and provides reciprocal `hreflang` metadata. Archive and static pages link to their corresponding Chinese or English route.

## UI and Metadata

The previous Chinese holding page is replaced by a Chinese home page. Shared route labels, breadcrumbs, metadata labels, and navigation use the existing Chinese UI copy or localized additions where needed. Canonical URLs use each page's own language URL; language alternates are emitted only when a paired translation exists.

The existing English RSS feed remains English-only. A Chinese RSS feed is out of scope.

## Translation Integrity

Add a Node validation command that scans all four content collections. It fails when a Chinese entry has no English entry with the same `translationKey`, or when either language repeats a key. It is included explicitly in the GitHub Pages build workflow, so an invalid content pair blocks deployment. English-only entries remain valid during future staged translation work.

## Translation Rules

Translations preserve the source article's facts, dates, project links, status, publication state, technical names, and Markdown/MDX structure. They localize prose, headings, titles, descriptions, tags, and SEO copy without inventing information. Each translated entry retains its source entry's slug, `translationKey`, and applicable metadata values.

## Verification

Unit tests cover translation-pair validation and link configuration. Browser tests cover Chinese archives, details, localized navigation, language switching, and the replacement of the holding page. The release checks run type checking, linting, format checking, unit and browser tests, build, and generated-link validation.

## Non-goals

This change does not redesign the visual system, rename English routes, replace project-specific repository links, add a Chinese RSS feed, or translate external linked resources.
