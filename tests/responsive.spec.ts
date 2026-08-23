import { expect, test } from "@playwright/test";

import { expectNoHorizontalScroll } from "./helpers";

/**
 * Buyers arrive from social media, overwhelmingly on a phone, so mobile is the
 * case that matters most rather than the one checked last.
 */
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const PAGES = ["/", "/accounts", "/sell"] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const path of PAGES) {
      test(`${path} never scrolls sideways`, async ({ page }) => {
        await page.goto(path);
        await expectNoHorizontalScroll(page);
      });
    }

    test("body text stays at a readable size", async ({ page }) => {
      await page.goto("/accounts");

      const size = await page.evaluate(
        () =>
          Number.parseFloat(
            getComputedStyle(document.body).fontSize.replace("px", ""),
          ),
      );

      expect(size, "body text must not drop below 14px").toBeGreaterThanOrEqual(14);
    });

    test("headings do not overflow their container", async ({ page }) => {
      await page.goto("/");

      const overflowing = await page.evaluate(() =>
        [...document.querySelectorAll("h1, h2, h3")].filter(
          (el) => el.scrollWidth > el.clientWidth + 1,
        ).length,
      );

      expect(overflowing, "no heading may overflow").toBe(0);
    });
  });
}

test.describe("layout switches deliberately, not by shrinking", () => {
  test("filters are a sheet on mobile and a sidebar on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/accounts");
    await expect(page.getByRole("button", { name: /^Filters/ })).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/accounts");
    // The trigger is hidden above lg because the sidebar is always on screen.
    await expect(page.getByRole("button", { name: /^Filters/ })).toBeHidden();
    await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible();
  });

  test("the mobile filter sheet opens, filters, and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/accounts");

    await page.getByRole("button", { name: /^Filters/ }).click();
    await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible();

    await page.getByRole("button", { name: "100+" }).click();
    await expect(page).toHaveURL(/min_skins=100/);

    await page.getByRole("button", { name: /^Show \d+ account/ }).click();
    await expect(page.getByRole("heading", { name: "Filters" })).toBeHidden();
  });

  test("touch targets meet the 44px minimum on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/accounts");

    // Measures the real hit area, which for small icon buttons is grown by the
    // .hit-target pseudo-element rather than by the button's own box.
    const tooSmall = await page.evaluate(() => {
      const MIN = 44;
      const offenders: string[] = [];

      for (const el of document.querySelectorAll<HTMLElement>(
        "button, a[href], input[type=checkbox]",
      )) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Visually hidden until focused — the skip link. It has no on-screen
        // target to measure.
        if (el.closest(".sr-only")) continue;
        if (rect.width <= 1 && rect.height <= 1) continue;

        // A link inside a sentence is exempt: WCAG's target-size rule does not
        // govern inline text, and padding one out would break the paragraph it
        // sits in. Standalone navigation and controls are still held to 44px.
        const inProse = el.tagName === "A" && el.closest("p, dd, li > p");
        if (inProse) continue;

        let { width, height } = rect;

        const after = getComputedStyle(el, "::after");
        const aw = Number.parseFloat(after.width);
        const ah = Number.parseFloat(after.height);
        if (Number.isFinite(aw) && Number.isFinite(ah)) {
          width = Math.max(width, aw);
          height = Math.max(height, ah);
        }

        // A label wrapping a checkbox provides the real target.
        const label = el.closest("label");
        if (label) {
          const lr = label.getBoundingClientRect();
          width = Math.max(width, lr.width);
          height = Math.max(height, lr.height);
        }

        if (width < MIN || height < MIN) {
          offenders.push(
            `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}" ${Math.round(width)}x${Math.round(height)}`,
          );
        }
      }
      return offenders;
    });

    expect(tooSmall, `targets below 44px: ${tooSmall.join(" | ")}`).toEqual([]);
  });
});
