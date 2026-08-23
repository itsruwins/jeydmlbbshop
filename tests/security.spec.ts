import { expect, test } from "@playwright/test";

/**
 * The tests that matter most, because every failure here is a breach rather
 * than a blemish.
 */
test.describe("security", () => {
  test("every admin route redirects an anonymous visitor to login", async ({
    page,
  }) => {
    const guarded = [
      "/admin",
      "/admin/dashboard",
      "/admin/accounts",
      "/admin/accounts/new",
      "/admin/social-links",
      "/admin/accounts/00000000-0000-0000-0000-000000000000/edit",
    ];

    for (const path of guarded) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} must not 500`).toBeLessThan(400);
      await expect(page, `${path} must land on login`).toHaveURL(
        /\/admin\/login/,
      );
    }
  });

  test("admin markup is never sent to an anonymous visitor", async ({
    request,
  }) => {
    // Following redirects would show the login page; what matters is that the
    // dashboard body was never in the response at all.
    const response = await request.get("/admin/dashboard", {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    const body = await response.text();
    for (const leak of ["Overview", "Total", "Reserved", "New listing"]) {
      expect(body, `response must not contain "${leak}"`).not.toContain(leak);
    }
  });

  test("no service-role key or secret reaches the browser", async ({
    page,
  }) => {
    await page.goto("/accounts");

    const html = await page.content();
    const scripts = await page.evaluate(() =>
      [...document.querySelectorAll("script")].map((s) => s.textContent ?? "").join(""),
    );
    const haystack = `${html}${scripts}`;

    // A Supabase secret key is `sb_secret_...`; a legacy service-role key is a
    // JWT whose payload names the role. Neither may ever ship to a client.
    expect(haystack).not.toMatch(/sb_secret_/);
    expect(haystack).not.toMatch(/service_role/);
    expect(haystack).not.toMatch(/SUPABASE_SERVICE/);
  });

  test("the publishable key is the only Supabase credential exposed", async ({
    page,
  }) => {
    await page.goto("/accounts");
    const scripts = await page.evaluate(() =>
      [...document.querySelectorAll("script")].map((s) => s.textContent ?? "").join(""),
    );

    // Its presence is expected and safe — RLS filters every request it makes.
    // This asserts the *shape* of what is exposed, not that nothing is.
    const keys = scripts.match(/sb_[a-z]+_/g) ?? [];
    for (const key of keys) {
      expect(key).toBe("sb_publishable_");
    }
  });

  test("anonymous writes are rejected by row level security", async ({
    request,
  }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const response = await request.post(`${url}/rest/v1/accounts`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      data: { account_reference: "ZZTEST-rls-probe", title: "probe", price: 1 },
    });

    expect(
      response.status(),
      "anonymous insert must be refused",
    ).toBeGreaterThanOrEqual(400);
  });

  test("anonymous readers cannot see profiles", async ({ request }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const response = await request.get(`${url}/rest/v1/profiles?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual([]);
  });

  test("hidden listings never reach the public catalogue", async ({
    page,
    request,
  }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    // What the database is willing to hand an anonymous caller.
    const response = await request.get(
      `${url}/rest/v1/accounts?select=account_reference,status`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    const rows: Array<{ account_reference: string; status: string }> =
      await response.json();

    expect(
      rows.every((row) => row.status !== "hidden"),
      "RLS must not return hidden rows to anon",
    ).toBeTruthy();

    // And what the rendered page actually shows, which is the layer that
    // regressed once already by forwarding an admin session to a public page.
    await page.goto("/accounts");
    const body = await page.locator("body").innerText();

    for (const row of rows) {
      if (row.status === "hidden") {
        expect(body).not.toContain(row.account_reference);
      }
    }
  });

  test("public pages render identically with a stale session cookie", async ({
    page,
  }) => {
    // The Phase 7 defect in miniature: a public page must not vary by viewer.
    //
    // The catalogue streams in behind a Suspense boundary, so both captures
    // have to wait for the results to arrive. Reading innerText immediately
    // compares a skeleton against finished content and fails for a reason that
    // has nothing to do with sessions.
    const settled = async () => {
      await page.getByLabel("Search accounts").waitFor({ state: "visible" });
      return page.locator("body").innerText();
    };

    await page.goto("/accounts");
    const anonymous = await settled();

    await page.context().addCookies([
      {
        name: "sb-access-token",
        value: "not-a-real-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/accounts");
    const withCookie = await settled();

    expect(withCookie).toBe(anonymous);
  });
});
