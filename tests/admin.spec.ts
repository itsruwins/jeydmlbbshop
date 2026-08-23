import { expect, test } from "@playwright/test";

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  HAS_ADMIN_CREDENTIALS,
  SKIP_REASON,
  loginAsAdmin,
  testReference,
} from "./helpers";

/**
 * These write to the real Supabase project — there is no separate test
 * database. Every test that creates a listing deletes it again, and everything
 * created is prefixed `ZZTEST-` so anything an interrupted run leaves behind is
 * obvious in the catalogue and easy to find in the database.
 *
 * Serial, not parallel: they share one account catalogue, and a listing being
 * deleted by one test while another counts rows is a flake, not a defect.
 */
test.describe.configure({ mode: "serial" });

test.describe("admin authentication", () => {
  test("wrong credentials are refused without revealing which half was wrong", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("definitely-not-a-user@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Next injects its own empty role="alert" route announcer, so scope this
    // to the form's alert rather than matching by role alone.
    const error = page.locator("form").getByRole("alert");
    await expect(error).toBeVisible();

    // One message for both cases, so the form cannot be used to discover which
    // email addresses have accounts.
    await expect(error).toContainText(/do not match an account/i);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("an empty submission is refused", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test.describe("with credentials", () => {
    test.skip(!HAS_ADMIN_CREDENTIALS, SKIP_REASON);

    test("signs in and reaches the dashboard", async ({ page }) => {
      await loginAsAdmin(page);
      await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
      await expect(page.getByText("Total")).toBeVisible();
    });

    test("returns to the page that required signing in", async ({ page }) => {
      await page.goto("/admin/accounts/new");
      await expect(page).toHaveURL(/next=/);

      await page.getByLabel("Email").fill(ADMIN_EMAIL);
      await page.getByLabel("Password").fill(ADMIN_PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page).toHaveURL(/\/admin\/accounts\/new/);
    });

    test("signing out ends the session", async ({ page }) => {
      await loginAsAdmin(page);
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/admin\/login/);

      await page.goto("/admin/dashboard");
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  });
});

test.describe("account lifecycle", () => {
  test.skip(!HAS_ADMIN_CREDENTIALS, SKIP_REASON);

  test("creates, edits, publishes and deletes a listing", async ({ page }) => {
    const reference = testReference();

    await loginAsAdmin(page);
    await page.goto("/admin/accounts/new");

    // The reference is auto-generated; replace it with a traceable test value.
    const referenceField = page.getByLabel("Account reference");
    await expect(referenceField).not.toHaveValue("");
    await referenceField.fill(reference);

    await page.getByLabel("Price").fill("1234");
    await page.getByLabel("Rank").selectOption({ index: 1 });
    await page.getByLabel("Collection level").selectOption({ index: 1 });
    await page.getByLabel("Skins").fill("42");

    await page.getByRole("button", { name: "Create listing" }).click();

    // Creation lands on the edit screen, because images need the listing's id.
    await expect(page).toHaveURL(/\/admin\/accounts\/[0-9a-f-]+\/edit/);
    const editUrl = page.url();

    // The reference is the public URL, so it must be immutable after creation.
    await expect(page.getByLabel("Account reference")).toHaveAttribute(
      "readonly",
      "",
    );

    // A hidden listing must not be reachable publicly.
    const hiddenResponse = await page.request.get(`/accounts/${reference}`);
    expect(hiddenResponse.status()).toBe(404);

    // Publish it.
    await page.goto(editUrl);
    await page.getByLabel("Status").selectOption("available");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    // Now it is public.
    await expect(async () => {
      const response = await page.request.get(`/accounts/${reference}`);
      expect(response.status()).toBe(200);
    }).toPass({ timeout: 15_000 });

    // Delete it, and confirm the public page goes with it.
    await page.goto(editUrl);
    await page.getByRole("button", { name: /^Delete/ }).click();
    await page.getByRole("button", { name: "Delete listing" }).click();

    await expect(page).toHaveURL(/\/admin\/accounts$/, { timeout: 15_000 });

    await expect(async () => {
      const response = await page.request.get(`/accounts/${reference}`);
      expect(response.status()).toBe(404);
    }).toPass({ timeout: 15_000 });
  });

  test("selling a listing clears its featured flag", async ({ page }) => {
    const reference = testReference();

    await loginAsAdmin(page);
    await page.goto("/admin/accounts/new");

    await page.getByLabel("Account reference").fill(reference);
    await page.getByLabel("Price").fill("2345");
    await page.getByLabel("Rank").selectOption({ index: 1 });
    await page.getByLabel("Collection level").selectOption({ index: 1 });
    await page.getByLabel("Status").selectOption("available");
    await page.getByLabel(/Feature this listing/).check();
    await page.getByRole("button", { name: "Create listing" }).click();

    await expect(page).toHaveURL(/\/edit/);
    const editUrl = page.url();
    await expect(page.getByLabel(/Feature this listing/)).toBeChecked();

    // Sold listings must drop off the homepage, and lose the flag outright so
    // they cannot silently reappear if set back to available.
    await page.getByLabel("Status").selectOption("sold");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/Changes saved/i)).toBeVisible();

    await page.goto(editUrl);
    await expect(page.getByLabel(/Feature this listing/)).not.toBeChecked();
    await expect(page.getByLabel(/Feature this listing/)).toBeDisabled();

    // Clean up.
    await page.getByRole("button", { name: /^Delete/ }).click();
    await page.getByRole("button", { name: "Delete listing" }).click();
    await expect(page).toHaveURL(/\/admin\/accounts$/, { timeout: 15_000 });
  });

  test("a duplicate reference is reported on the field, not as a page error", async ({
    page,
  }) => {
    const reference = testReference();

    await loginAsAdmin(page);

    const create = async () => {
      await page.goto("/admin/accounts/new");
      await page.getByLabel("Account reference").fill(reference);
      await page.getByLabel("Price").fill("999");
      await page.getByLabel("Rank").selectOption({ index: 1 });
      await page.getByLabel("Collection level").selectOption({ index: 1 });
      await page.getByRole("button", { name: "Create listing" }).click();
    };

    await create();
    await expect(page).toHaveURL(/\/edit/);
    const editUrl = page.url();

    await create();
    await expect(page.getByText(/already in use/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/accounts\/new/);

    await page.goto(editUrl);
    await page.getByRole("button", { name: /^Delete/ }).click();
    await page.getByRole("button", { name: "Delete listing" }).click();
    await expect(page).toHaveURL(/\/admin\/accounts$/, { timeout: 15_000 });
  });

  test("required fields are validated before anything is written", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/accounts/new");

    await page.getByLabel("Title").fill("");
    await page.getByLabel("Price").fill("");
    await page.getByRole("button", { name: "Create listing" }).click();

    await expect(page).toHaveURL(/\/admin\/accounts\/new/);
    await expect(page.locator("form").getByRole("alert").first()).toBeVisible();
  });
});

test.describe("social links", () => {
  test.skip(!HAS_ADMIN_CREDENTIALS, SKIP_REASON);

  test("a link cannot be saved without a label", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/social-links");

    await page.getByRole("button", { name: /Add a(nother)? link/ }).click();
    await page.getByLabel("Platform").selectOption("Telegram");
    await page.getByLabel("Button label").fill("");
    await page.getByLabel("Link").fill("https://t.me/example");
    await page.getByRole("button", { name: "Add link" }).click();

    // A blank label previously rendered a button reading "Message us on ".
    await expect(page.getByText(/Add a label/i)).toBeVisible();
  });

  test("a Facebook link offers Messenger as a suggestion, not a rewrite", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/social-links");

    await page.getByRole("button", { name: /Add a(nother)? link/ }).click();
    await page.getByLabel("Link").fill("https://www.facebook.com/examplepage");

    // Suggested, with the Pages-only caveat stated.
    await expect(
      page.getByRole("link", { name: "https://m.me/examplepage" }),
    ).toBeVisible();
    await expect(page.getByText(/only works for Pages/i)).toBeVisible();

    // The field is untouched until the admin opts in.
    await expect(page.getByLabel("Link")).toHaveValue(
      "https://www.facebook.com/examplepage",
    );

    await page.getByRole("button", { name: "Use this link instead" }).click();
    await expect(page.getByLabel("Link")).toHaveValue("https://m.me/examplepage");
  });
});
