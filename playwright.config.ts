import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests, run against a real production build.
 *
 * `next build && next start` rather than `next dev`, deliberately. Two of the
 * behaviours these tests assert — the 404 status on a missing listing, and the
 * revalidate windows on the cached pages — behave differently under the dev
 * server, so testing against dev would give false confidence in exactly the
 * places that have already broken once.
 */
const PORT = Number(process.env.TEST_PORT ?? 3210);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: {
    command: `npx next build && npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
