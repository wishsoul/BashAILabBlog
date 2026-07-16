import type { Locale } from "../config/site";
import { SITE } from "../config/site";
import { absoluteUrl } from "./urls";

export const DEFAULT_OG_IMAGE = "/images/og/default.png";

export interface SiteConfig {
  name: string;
  description: string;
  siteUrl: string;
  basePath: string;
  defaultLocale: Locale;
  github?: string;
}

type SeoEntry = {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
};

type ArticleEntry = SeoEntry & {
  publishedAt?: Date | null;
  updatedAt?: Date | null;
};

type WorkEntry = SeoEntry & {
  category: "Products" | "Infrastructure" | "Experiments";
  platform: string;
};

export type JsonLd = Record<string, unknown>;

export interface LanguageAlternate {
  href: string;
  hrefLang: Locale | "x-default";
}

function imageUrl(image: string | undefined, config: SiteConfig): string {
  return absoluteUrl(image ?? DEFAULT_OG_IMAGE, config);
}

export function buildCanonical(
  path: string,
  config: SiteConfig = SITE,
): string {
  return absoluteUrl(path, config);
}

export function buildPersonJsonLd(config: SiteConfig = SITE): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Bash",
    url: buildCanonical("/", config),
    ...(config.github ? { sameAs: [config.github] } : {}),
  };
}

export function buildWebsiteJsonLd(config: SiteConfig = SITE): JsonLd {
  const url = buildCanonical("/", config);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    name: config.name,
    description: config.description,
    url,
  };
}

export function buildArticleJsonLd(
  entry: ArticleEntry,
  config: SiteConfig = SITE,
): JsonLd {
  const url = buildCanonical(entry.canonicalPath, config);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.description,
    image: imageUrl(entry.image, config),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: buildPersonJsonLd(config),
    ...(entry.publishedAt
      ? { datePublished: entry.publishedAt.toISOString() }
      : {}),
    ...(entry.updatedAt ? { dateModified: entry.updatedAt.toISOString() } : {}),
  };
}

export function buildWorkJsonLd(
  entry: WorkEntry,
  config: SiteConfig = SITE,
): JsonLd {
  const url = buildCanonical(entry.canonicalPath, config);
  const isProduct = entry.category === "Products";

  return {
    "@context": "https://schema.org",
    "@type": isProduct ? "SoftwareApplication" : "CreativeWork",
    name: entry.title,
    description: entry.description,
    image: imageUrl(entry.image, config),
    url,
    ...(isProduct
      ? {
          applicationCategory: "SoftwareApplication",
          operatingSystem: entry.platform,
        }
      : { genre: entry.category }),
  };
}

export function buildLanguageAlternates(
  page: { lang: Locale; canonicalPath: string; translationPath?: string },
  config: SiteConfig = SITE,
): LanguageAlternate[] {
  if (!page.translationPath) return [];

  const alternateLocale: Locale = page.lang === "en" ? "zh" : "en";
  const currentUrl = buildCanonical(page.canonicalPath, config);
  const translationUrl = buildCanonical(page.translationPath, config);
  const englishUrl = page.lang === "en" ? currentUrl : translationUrl;

  return [
    { href: currentUrl, hrefLang: page.lang },
    { href: translationUrl, hrefLang: alternateLocale },
    { href: englishUrl, hrefLang: "x-default" },
  ];
}
