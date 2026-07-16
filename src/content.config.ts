import type { SchemaContext } from "astro:content";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const WORK_STATUSES = [
  "Exploring",
  "Researching",
  "Designing",
  "Building",
  "Testing",
  "Active",
  "Paused",
  "Shipped",
] as const;

export const WORK_CATEGORIES = [
  "Products",
  "Infrastructure",
  "Experiments",
] as const;

export const RESEARCH_CATEGORIES = [
  "Agentic Development",
  "AI-Native Interfaces",
  "Independent Products",
  "AI Product Management",
  "Human-AI Collaboration",
] as const;

export const RESEARCH_STATUSES = [
  "Note",
  "Essay",
  "Research",
  "Experiment",
  "Framework",
  "Case Study",
] as const;

export const LOG_TYPES = [
  "Build Log",
  "Research Note",
  "Experiment",
  "Changelog",
  "Decision",
] as const;

function sharedSchema(image: SchemaContext["image"]) {
  return z.object({
    lang: z.enum(["en", "zh"]),
    translationKey: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    draft: z.boolean().default(false),
    tags: z.array(z.string()),
    updatedAt: z.coerce.date().optional(),
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      image: image().optional(),
    }),
  });
}

const work = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/work",
  }),
  schema: ({ image }) =>
    sharedSchema(image).extend({
      slug: z.string().min(1).optional(),
      year: z.number().int().nullable(),
      startedAt: z.coerce.date().nullable(),
      status: z.enum(WORK_STATUSES),
      category: z.enum(WORK_CATEGORIES),
      featured: z.boolean().default(false),
      cover: image().optional(),
      github: z.url().optional(),
      demo: z.url().optional(),
      platform: z.string().min(1),
      role: z.string().min(1),
      order: z.number().int(),
    }),
});

const research = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/research",
  }),
  schema: ({ image }) =>
    sharedSchema(image)
      .extend({
        kind: z.enum(["theme", "article"]),
        category: z.enum(RESEARCH_CATEGORIES),
        status: z.enum(RESEARCH_STATUSES),
        publishedAt: z.coerce.date().nullable().optional(),
        readingMinutes: z.number().int().positive().optional(),
        featured: z.boolean().default(false),
        relatedProject: z.string().min(1).optional(),
      })
      .superRefine((entry, context) => {
        if (entry.kind === "article" && !entry.draft && !entry.publishedAt) {
          context.addIssue({
            code: "custom",
            path: ["publishedAt"],
            message: "Published research articles require a publication date",
          });
        }
      }),
});

const log = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/log",
  }),
  schema: ({ image }) =>
    sharedSchema(image).extend({
      date: z.coerce.date(),
      type: z.enum(LOG_TYPES),
      summary: z.string().min(1),
      relatedProject: z.string().min(1).optional(),
    }),
});

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/pages",
  }),
  schema: ({ image }) => sharedSchema(image),
});

export const collections = { work, research, log, pages };
