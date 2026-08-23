import { expect, type Page } from "@playwright/test";

/**
 * Admin credentials come from the environment and are never committed.
 *
 * `.env.local` is gitignored. Tests that need a session skip themselves when
 * these are absent, so the suite stays green for anyone who has not set them up
 * rather than failing for a reason that is not a defect.
 */
export const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "";
export const HAS_ADMIN_CREDENTIALS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

export const SKIP_REASON =
  "Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in .env.local to run the admin tests.";

/**
 * Test listings carry this prefix so anything left behind by an interrupted run
 * is obvious in the catalogue and trivially greppable in the database.
 *
 * These tests write to the real Supabase project — there is no separate test
 * database — so every test that creates something is responsible for removing
 * it again.
 */
export const TEST_PREFIX = "ZZTEST";

export function testReference(): string {
  return `${TEST_PREFIX}-${Date.now().toString().slice(-8)}`;
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

/** Fails if the page scrolls sideways — the most common responsive defect. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow, "page must not scroll horizontally").toBeLessThanOrEqual(1);
}
