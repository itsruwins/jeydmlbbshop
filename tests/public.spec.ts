import { expect, test } from "@playwright/test";

test.describe("public marketplace", () => {
  test("homepage leads with inventory and both paths", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("Mobile Legends accounts");

    await expect(page.getByRole("link", { name: "Browse accounts" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sell your account" }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "How buying works" }),
    ).toBeVisible();
  });

  test("both header links resolve — no dead navigation", async ({ page }) => {
    for (const [name, pattern] of [
      ["Browse accounts", /\/accounts$/],
      ["Sell yours", /\/sell$/],
    ] as const) {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name }).click();
      await expect(page).toHaveURL(pattern);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("catalogue lists accounts and links to each one", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByRole("heading", { name: "Browse accounts" })).toBeVisible();

    const cards = page.locator('a[href^="/accounts/"]');
    const count = await cards.count();

    if (count === 0) {
      // An empty catalogue is a valid state, and it must teach rather than
      // show a blank page.
      await expect(page.getByText(/No accounts listed yet/i)).toBeVisible();
      return;
    }

    const first = cards.first();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  test("search narrows the catalogue and survives a reload", async ({ page }) => {
    await page.goto("/accounts");
    await page.getByLabel("Search accounts").fill("MLBB");
    await expect(page).toHaveURL(/[?&]q=MLBB/, { timeout: 5000 });

    // Filters live in the URL so a filtered view can be shared; reloading must
    // restore the same state.
    await page.reload();
    await expect(page.getByLabel("Search accounts")).toHaveValue("MLBB");
  });

  test("each filter writes its own URL parameter", async ({ page }) => {
    await page.goto("/accounts");

    await page.getByLabel("Sort accounts").selectOption("price_asc");
    await expect(page).toHaveURL(/[?&]sort=price_asc/);

    await page.getByLabel("Minimum price").fill("1000");
    await page.getByLabel("Minimum price").blur();
    await expect(page).toHaveURL(/[?&]min_price=1000/);

    await page.getByRole("button", { name: "100+" }).click();
    await expect(page).toHaveURL(/[?&]min_skins=100/);

    await page.getByLabel("Minimum collection level").selectOption({ index: 1 });
    await expect(page).toHaveURL(/[?&]min_collection=/);
  });

  test("a shared filter link renders the same filtered view", async ({ page }) => {
    await page.goto("/accounts?sort=price_desc&min_skins=50");

    await expect(page.getByLabel("Sort accounts")).toHaveValue("price_desc");
    await expect(page.getByRole("button", { name: "50+" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("impossible filters show a recovery path, not a blank page", async ({
    page,
  }) => {
    await page.goto("/accounts?min_price=99999999");

    await expect(page.getByText(/No accounts match those filters/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
  });

  test("a reversed price range is corrected rather than returning nothing", async ({
    page,
  }) => {
    await page.goto("/accounts?min_price=50000&max_price=1000");
    // Swapped back into order, so the filter behaves as intended instead of
    // looking broken.
    await expect(page.getByText(/No accounts match those filters/i)).toHaveCount(0);
  });

  test("a missing listing returns 404, not a soft 404", async ({ page }) => {
    const response = await page.goto("/accounts/DOES-NOT-EXIST-9999");

    // Status, not just appearance: these URLs get shared and crawled.
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/not available/i)).toBeVisible();
  });

  test("an unknown route returns a styled 404", async ({ page }) => {
    const response = await page.goto("/no-such-page");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse accounts" })).toBeVisible();
  });

  test("a listing page shows its details, gallery and contact route", async ({
    page,
  }) => {
    await page.goto("/accounts");
    const cards = page.locator('a[href^="/accounts/"]');
    test.skip((await cards.count()) === 0, "no listings to open");

    await cards.first().click();

    await expect(page.getByRole("heading", { name: "Account details" })).toBeVisible();
    await expect(page.getByText("Quote this reference")).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy/ })).toBeVisible();

    // Price must render as currency, never a bare number or a float.
    await expect(page.locator("body")).toContainText(/₱[\d,]+/);
  });

  test("the seller page explains the process and offers contact twice", async ({
    page,
  }) => {
    await page.goto("/sell");

    for (const heading of [
      "How it works",
      "What to have ready",
      "Screenshots we need",
      "What affects the price",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }

    // No registration, login, or submission form in the MVP.
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Ready to send it over/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Send us your account/ })).toBeVisible();
  });

  test("contact links open a chat, and open externally", async ({ page }) => {
    await page.goto("/sell");

    const cta = page.getByRole("link", { name: /Message us on/ }).first();
    const configured = (await cta.count()) > 0;
    test.skip(!configured, "no social links configured yet");

    const href = await cta.getAttribute("href");

    // The destination is whatever the admin saved, unrewritten — so this
    // asserts it is a real external link, not that it points anywhere in
    // particular.
    expect(href).toMatch(/^https:\/\//);

    await expect(cta).toHaveAttribute("target", "_blank");
    await expect(cta).toHaveAttribute("rel", /noopener/);
  });
});
