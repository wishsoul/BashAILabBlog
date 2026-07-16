// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import process from "node:process";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL ?? "https://wishsoul.github.io",
  base: process.env.PUBLIC_BASE_PATH ?? "/BashAILabBlog",
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
