export type Locale = "en" | "zh";

export const SITE = {
  name: "Bash AI Lab",
  title: "Bash AI Lab — AI Product Research & Independent Software",
  description:
    "AI product research, agentic development systems and independent software built by Bash.",
  siteUrl: import.meta.env.PUBLIC_SITE_URL ?? "https://wishsoul.github.io",
  basePath: import.meta.env.PUBLIC_BASE_PATH ?? "/BashAILabBlog",
  defaultLocale: "en" as const,
  locales: ["en", "zh"] as const,
  github: "https://github.com/bashxu",
  email: import.meta.env.PUBLIC_EMAIL || null,
  resumeDownload: import.meta.env.PUBLIC_RESUME_PATH || null,
} as const;

export const NAV_ITEMS = [
  { key: "work", href: "/work/" },
  { key: "research", href: "/research/" },
  { key: "log", href: "/log/" },
  { key: "about", href: "/about/" },
] as const;
