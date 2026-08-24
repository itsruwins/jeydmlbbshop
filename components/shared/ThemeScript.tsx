import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Resolves the theme before the browser paints anything.
 *
 * This has to be a blocking inline script in `<head>`. React cannot do it:
 * by the time a component runs, the first frame is already on screen, and a
 * visitor who chose Light would watch the page load black and then flip. That
 * flash is the single most common defect in a hand-rolled theme switcher.
 *
 * It is a bare `<script>` element, deliberately, and not `next/script` with
 * `strategy="beforeInteractive"`.
 *
 * React logs a development warning about this — "Encountered a script tag while
 * rendering React component" — whenever something re-renders the root layout on
 * the client, which the admin does after every mutation. The warning is
 * accurate: on *that* render the tag is inert markup. It is also harmless here,
 * because the only render that has to produce this script is the server one,
 * and the warning is stripped from production builds.
 *
 * `beforeInteractive` was tried and reverted. It does not emit a blocking
 * inline script; it queues the code through Next's own runtime, which runs
 * after the first paint. Measured with a frame-by-frame capture and a stored
 * "light" preference, the first painted frame came back black — the exact
 * flash this component exists to prevent. A dev-only console warning is a
 * smaller cost than every returning visitor seeing the wrong theme.
 *
 * The rules, in order:
 *   1. An explicit stored choice of "light" or "dark" wins.
 *   2. "system" follows the device, and keeps following it — `ThemeToggle`
 *      attaches a listener so a phone switching to night mode is picked up
 *      without a reload.
 *   3. No stored choice at all resolves to dark. The storefront is composed on
 *      a black ground, so dark is the design rather than an alternative to it,
 *      and a first-time visitor should see what was designed.
 *
 * `try/catch` because `localStorage` throws outright in some privacy modes;
 * a theme preference is not worth a blank page.
 */
export function ThemeScript() {
  const script = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});var t=s==="light"||s==="dark"?s:s==="system"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

  return (
    <script
      // The content is a constant defined above — no interpolation of anything
      // that came from a request, a user, or the database.
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
