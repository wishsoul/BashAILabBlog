import { SITE } from "../config/site";

export function normalizeBase(base: string): string {
  if (!base || base === "/") return "/";
  return `/${base.replace(/^\/+|\/+$/g, "")}/`;
}

export function withBase(path: string, base = SITE.basePath): string {
  if (
    /^(?:[a-z]+:)?\/\//i.test(path) ||
    path.startsWith("#") ||
    path.startsWith("mailto:")
  )
    return path;
  const normalizedBase = normalizeBase(base);
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;
  if (normalizedBase !== "/" && normalizedPath.startsWith(normalizedBase))
    return normalizedPath;
  return normalizedBase === "/"
    ? normalizedPath
    : `${normalizedBase.slice(0, -1)}${normalizedPath}`;
}

export function absoluteUrl(
  path: string,
  options: { siteUrl?: string; basePath?: string } = {},
): string {
  const siteUrl = options.siteUrl ?? SITE.siteUrl;
  const basePath = options.basePath ?? SITE.basePath;
  return new URL(
    withBase(path, basePath),
    `${siteUrl.replace(/\/+$/, "")}/`,
  ).toString();
}
