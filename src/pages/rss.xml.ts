import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { contentSlug } from "../lib/content";
import { absoluteUrl } from "../lib/urls";

export const GET: APIRoute = async () => {
  const [research, log] = await Promise.all([
    getCollection("research"),
    getCollection("log"),
  ]);

  const researchItems = research
    .filter((entry) => entry.data.lang === "en" && !entry.data.draft)
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      link: absoluteUrl(`/research/${contentSlug(entry.id)}/`),
      pubDate: entry.data.publishedAt ?? undefined,
      categories: entry.data.tags,
    }));
  const logItems = log
    .filter((entry) => entry.data.lang === "en" && !entry.data.draft)
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      link: absoluteUrl(`/log/#${contentSlug(entry.id)}`),
      pubDate: entry.data.date,
      categories: entry.data.tags,
    }));
  const items = [...researchItems, ...logItems].sort(
    (a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0),
  );

  return rss({
    title: `${SITE.name} RSS`,
    description: SITE.description,
    site: absoluteUrl("/"),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />`,
    items,
  });
};
