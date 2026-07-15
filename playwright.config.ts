import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:4321/BashAILabBlog/",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "PUBLIC_SITE_URL=http://127.0.0.1:4321 PUBLIC_BASE_PATH=/BashAILabBlog npm run build && npm run preview -- --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321/BashAILabBlog/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
