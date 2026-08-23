import { expect, test } from "@playwright/test";

/**
 * Structural accessibility checks, written against the DOM rather than with an
 * audit library so the suite stays dependency-light. These catch the failures
 * that actually occur in this codebase — an unlabelled control, a removed focus
 * ring, an image with no alt text — rather than scoring the page.
 */
const PAGES = ["/", "/accounts", "/sell"] as const;

for (const path of PAGES) {
  test.describe(path, () => {
    test("has exactly one h1, and headings do not skip levels", async ({
      page,
    }) => {
      await page.goto(path);

      const levels = await page.evaluate(() =>
        [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) =>
          Number(el.tagName[1]),
        ),
      );

      expect(levels.filter((l) => l === 1)).toHaveLength(1);

      let previous = levels[0];
      for (const level of levels.slice(1)) {
        expect(
          level - previous,
          `heading jumped from h${previous} to h${level}`,
        ).toBeLessThanOrEqual(1);
        previous = level;
      }
    });

    test("every image has alt text", async ({ page }) => {
      await page.goto(path);

      const missing = await page.evaluate(() =>
        [...document.querySelectorAll("img")]
          .filter((img) => img.getAttribute("alt") === null)
          .map((img) => img.getAttribute("src")?.slice(0, 60) ?? "?"),
      );

      expect(missing, `images without alt: ${missing.join(", ")}`).toEqual([]);
    });

    test("every control has an accessible name", async ({ page }) => {
      await page.goto(path);

      const unnamed = await page.evaluate(() => {
        const named = (el: HTMLElement): boolean => {
          if (el.getAttribute("aria-label")?.trim()) return true;
          if (el.getAttribute("aria-labelledby")?.trim()) return true;
          if (el.getAttribute("title")?.trim()) return true;
          if ((el.textContent ?? "").trim()) return true;
          if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
            return true;
          if (el.closest("label")) return true;
          return false;
        };

        return [
          ...document.querySelectorAll<HTMLElement>(
            "button, a[href], input:not([type=hidden]), select, textarea",
          ),
        ]
          .filter((el) => el.offsetParent !== null && !named(el))
          .map((el) => `${el.tagName.toLowerCase()}#${el.id || "(no id)"}`);
      });

      expect(unnamed, `unnamed controls: ${unnamed.join(", ")}`).toEqual([]);
    });

    test("focus is always visible", async ({ page }) => {
      await page.goto(path);

      // Tab through the first several stops and confirm each one paints a
      // focus indicator. `outline: none` with no replacement makes the site
      // unusable by keyboard, and is invisible to anyone using a mouse.
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");

        const visible = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return true;

          const style = getComputedStyle(el);
          const hasOutline =
            style.outlineStyle !== "none" &&
            Number.parseFloat(style.outlineWidth) > 0;

          return (
            hasOutline ||
            style.boxShadow !== "none" ||
            style.textDecorationLine.includes("underline")
          );
        });

        expect(visible, "focused element must show an indicator").toBeTruthy();
      }
    });

    test("the skip link is the first stop and reaches the content", async ({
      page,
    }) => {
      await page.goto(path);
      await page.keyboard.press("Tab");

      const first = page.locator(":focus");
      await expect(first).toContainText(/Skip to content/i);
      await expect(first).toHaveAttribute("href", "#main");
    });
  });
}

test("the language is declared for screen readers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("reduced motion is respected", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/accounts");

  const animated = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("*")].filter((el) => {
      const s = getComputedStyle(el);
      const duration = Number.parseFloat(s.animationDuration);
      return Number.isFinite(duration) && duration > 0.05;
    }).length,
  );

  expect(animated, "no long animation under prefers-reduced-motion").toBe(0);
  await context.close();
});
